// Single integration point for all AI features. The API key never reaches the browser:
// requests go to the app's own /api/ai endpoint, which calls Lovable AI.
export type AITask = "email" | "research" | "chat";
export type AIMessage = { role: "user" | "assistant"; content: string };

export async function streamAI(
  task: AITask,
  messages: AIMessage[],
  onText: (fullText: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, messages }),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "The AI request failed. Please try again.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    const errIdx = text.indexOf("\u0000ERROR:");
    if (errIdx >= 0) throw new Error(text.slice(errIdx + 7));
    onText(text);
  }
  if (!text.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return text;
}
