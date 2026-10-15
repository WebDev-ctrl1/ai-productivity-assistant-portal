import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const MODEL = "openai/gpt-6-astra";

const BASE_RULES = `You are a precise workplace productivity assistant. Write in clear, natural British-neutral professional English.
Never invent names, dates, figures, commitments, citations or facts the user did not supply. If something essential is missing, use a clearly marked placeholder in square brackets such as [date].
Avoid filler, clichés ("I hope this email finds you well"), and robotic phrasing.`;

const EMAIL = `${BASE_RULES}
Task: write one email from the user's details. Match the requested tone and email type exactly and retain every important detail they supplied.
Output format, exactly:
Subject: <subject line>

<email body including greeting and sign-off>
Output nothing else.`;

const RESEARCH = `${BASE_RULES}
Task: produce a detailed, specific analysis of the supplied material according to the selected mode.
You have NO internet access. If the user supplied only a URL, state plainly that you cannot open websites and ask them to paste the page content; you may only describe what is generally known about the topic while clearly labelling it as general knowledge, not the page's content.
Do not fabricate sources or citations. Flag uncertain claims as such.
Use these markdown headings where appropriate: ## Overview, ## Key Findings, ## Important Considerations, ## Recommendations.`;

const CHAT = `${BASE_RULES}
Task: act as a helpful workplace assistant in a conversation. Answer the user's specific request directly and practically, keeping prior context in mind. Use short paragraphs and bullet lists where useful.`;

const SYSTEMS = { email: EMAIL, research: RESEARCH, chat: CHAT } as const;
type Task = keyof typeof SYSTEMS;

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

        let body: { task?: Task; messages?: { role: "user" | "assistant"; content: string }[] };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const task = body.task;
        const msgs = (body.messages ?? []).filter((m) => m && typeof m.content === "string" && m.content.trim());
        if (!task || !(task in SYSTEMS) || msgs.length === 0) {
          return Response.json({ error: "Please provide some input." }, { status: 400 });
        }
        if (JSON.stringify(msgs).length > 120_000) {
          return Response.json({ error: "Input is too long. Please shorten it." }, { status: 400 });
        }

        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        let upstreamError: string | null = null;
        const result = streamText({
          model: provider.responses(MODEL),
          instructions: SYSTEMS[task],
          messages: msgs.map((m) => ({ role: m.role, content: m.content })) as ModelMessage[],
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              store: false,
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            },
          },
          onError: ({ error }) => {
            const e = error as { statusCode?: number; message?: string };
            upstreamError =
              e?.statusCode === 429
                ? "Too many requests right now. Please wait a moment and try again."
                : e?.statusCode === 402
                  ? "AI credits are used up for this workspace. Please add credits to continue."
                  : "The AI request failed. Please try again.";
            console.error("AI error", error);
          },
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.textStream) controller.enqueue(encoder.encode(chunk));
            } catch {
              upstreamError ??= "The AI request failed. Please try again.";
            }
            if (upstreamError) controller.enqueue(encoder.encode(`\u0000ERROR:${upstreamError}`));
            controller.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
