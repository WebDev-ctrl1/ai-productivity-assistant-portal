import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Sparkle, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AINote, CopyButton, ErrorNote, Field, PageHeader, Panel, Thinking, textareaCls } from "@/components/kit";
import { streamAI } from "@/lib/ai-service";
import { addActivity } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate professional, editable emails in a formal, friendly or persuasive tone." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Professional, context-aware emails in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"];
const TYPES = ["Business enquiry", "Follow-up", "Meeting Request", "Customer Support", "Job Application", "Apology", "General"];

function parse(text: string) {
  const m = text.match(/^\s*Subject:\s*(.*)\n?([\s\S]*)$/i);
  return m ? { subject: m[1].trim(), body: m[2].replace(/^\s*\n/, "") } : { subject: "", body: text };
}

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Formal");
  const [type, setType] = useState("General");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = purpose.trim() && context.trim();

  async function generate() {
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    const prompt = `Email type: ${type}\nTone: ${tone}\nRecipient: ${recipient.trim() || "(not specified — use a neutral greeting)"}\nSubject/purpose: ${purpose}\nContext and instructions:\n${context}`;
    try {
      const full = await streamAI("email", [{ role: "user", content: prompt }], (t) => {
        const p = parse(t);
        setSubject(p.subject);
        setBody(p.body);
      });
      const p = parse(full);
      setSubject(p.subject);
      setBody(p.body);
      addActivity("email", `Email: ${p.subject || purpose}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setRecipient(""); setPurpose(""); setContext(""); setSubject(""); setBody(""); setError(""); setTouched(false);
  }

  return (
    <div>
      <PageHeader title="Smart Email Generator" description="Describe what you need — the assistant writes a ready-to-edit email using only the details you provide." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Recipient" hint="(optional)">
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Procurement" />
          </Field>
          <Field label="Subject or purpose">
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up on last week's proposal" />
          </Field>
          <Field label="Context and instructions">
            <textarea rows={6} className={textareaCls} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Key details, what you want to achieve, anything that must be included…" />
          </Field>
          {touched && !valid && <ErrorNote message="Please add a subject or purpose and some context." />}
          <Field label="Tone">
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} type="button" onClick={() => setTone(t)}
                  className={cn("rounded-full border px-3 py-1.5 text-sm", tone === t ? "border-primary bg-accent text-accent-foreground" : "hover:bg-secondary")}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Email type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={textareaCls}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={generate} disabled={loading}><Sparkle /> Generate Email</Button>
            <Button variant="ghost" onClick={clearAll} disabled={loading}><Trash2 /> Clear</Button>
          </div>
        </Panel>

        <Panel className="flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Your email</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generate} disabled={loading || !body}><RefreshCw /> Regenerate</Button>
              <CopyButton text={subject ? `Subject: ${subject}\n\n${body}` : body} />
            </div>
          </div>
          {error && <ErrorNote message={error} />}
          {!body && !loading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Mail className="size-8" />
              <p className="mt-2 text-sm">Your generated email will appear here, ready to edit.</p>
            </div>
          ) : (
            <>
              {loading && <Thinking />}
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Email subject" />
              <textarea rows={14} className={cn(textareaCls, "flex-1")} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Email body" />
              <AINote />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
