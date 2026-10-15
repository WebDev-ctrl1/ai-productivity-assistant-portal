import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Send, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AINote, CopyButton, ErrorNote, Thinking, textareaCls } from "@/components/kit";
import { streamAI, type AIMessage } from "@/lib/ai-service";
import { addActivity, readJSON, writeJSON } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chat — Workplace AI" },
      { name: "description", content: "Chat with an AI assistant about everyday professional tasks." },
      { property: "og:title", content: "AI Workplace Chat" },
      { property: "og:description", content: "Practical, workplace-focused answers to your questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const KEY = "wpa.chat";
const SUGGESTIONS = ["Help me write a professional follow-up", "Summarise this document", "Help me prioritise my workload"];

function ChatPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMessages(readJSON<AIMessage[]>(KEY, [])); inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, loading]);

  function save(list: AIMessage[]) { setMessages(list); writeJSON(KEY, list); }

  async function send(text = input) {
    const content = text.trim();
    if (!content || loading) return;
    const history = [...messages, { role: "user" as const, content }];
    save(history);
    setInput("");
    setError("");
    setLoading(true);
    if (messages.length === 0) addActivity("chat", `Chat: ${content}`);
    try {
      const reply = await streamAI("chat", history, (t) => setMessages([...history, { role: "assistant", content: t }]));
      save([...history, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(history);
      setError((e as Error).message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function reset() { save([]); setError(""); setEditing(null); setInput(""); inputRef.current?.focus(); }

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[480px] flex-col rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">AI Workplace Chat</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} disabled={loading}><Plus /> New conversation</Button>
          <Button variant="ghost" size="sm" onClick={reset} disabled={loading || !messages.length}><Trash2 /> Clear</Button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Briefcase className="size-6" /></span>
            <p className="mt-3 font-semibold">How can I help with your work today?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1.5 text-sm hover:bg-secondary">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Briefcase className="size-3.5" /></span>
              <div className="min-w-0 max-w-[85%] flex-1 space-y-2">
                {editing === i ? (
                  <textarea rows={8} className={textareaCls} value={m.content}
                    onChange={(e) => setMessages(messages.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))} />
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                )}
                {!(loading && i === messages.length - 1) && (
                  <div className="flex gap-1">
                    <CopyButton text={m.content} size="icon" />
                    <Button variant="ghost" size="icon" aria-label={editing === i ? "Save edit" : "Edit response"}
                      onClick={() => { if (editing === i) { save(messages); setEditing(null); } else setEditing(i); }}>
                      {editing === i ? <Check /> : <Pencil />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {loading && messages[messages.length - 1]?.role === "user" && <Thinking label="Thinking…" />}
        {error && <ErrorNote message={error} />}
        <div ref={endRef} />
      </div>

      <div className="border-t p-3 md:p-4">
        <div className="flex items-end gap-2">
          <textarea ref={inputRef} rows={2} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about your work… (Shift+Enter for a new line)" className={cn(textareaCls, "resize-none")} />
          <Button onClick={() => send()} disabled={loading || !input.trim()} className="h-10"><Send /> Send</Button>
        </div>
        <div className="mt-2"><AINote /></div>
      </div>
    </div>
  );
}
