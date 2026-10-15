import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, RefreshCw, Search, Sparkle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AINote, CopyButton, ErrorNote, Field, PageHeader, Panel, Thinking, textareaCls } from "@/components/kit";
import { streamAI } from "@/lib/ai-service";
import { addActivity } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summarise, explain and compare pasted material and get practical recommendations." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Turn pasted articles and questions into clear findings and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const MODES = ["Summarise", "Explain", "Compare", "Recommendations"];

function ResearchPage() {
  const [source, setSource] = useState("");
  const [instruction, setInstruction] = useState("");
  const [mode, setMode] = useState("Summarise");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = source.trim();
  const isUrl = /^https?:\/\/\S+$/i.test(trimmed);

  async function generate() {
    setTouched(true);
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    const prompt = `Mode: ${mode}\nInstructions: ${instruction.trim() || "(none)"}\n${
      isUrl ? "The user supplied only this URL (you cannot open it):" : "Material / question:"
    }\n${trimmed}`;
    try {
      await streamAI("research", [{ role: "user", content: prompt }], setOutput);
      addActivity("research", `${mode}: ${trimmed.slice(0, 70)}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Research Assistant" description="Paste an article, notes or a question. The assistant analyses what you provide — it does not browse the web." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Topic, question, pasted article or URL">
            <textarea rows={9} className={textareaCls} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste the text you want analysed, or ask a question…" />
          </Field>
          {isUrl && (
            <div className="rounded-lg border bg-secondary p-3 text-sm">
              <p>This app can't fetch websites. For an accurate analysis, open the page and paste its content above.</p>
              <a href={trimmed} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline">
                Open website in a new tab <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}
          {touched && !trimmed && <ErrorNote message="Please add a topic, question or some text to analyse." />}
          <Field label="Research instruction" hint="(optional)">
            <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="e.g. Focus on risks for a small team" />
          </Field>
          <Field label="Mode">
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={cn("rounded-full border px-3 py-1.5 text-sm", mode === m ? "border-primary bg-accent text-accent-foreground" : "hover:bg-secondary")}>
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={generate} disabled={loading}><Sparkle /> Generate Research</Button>
            <Button variant="ghost" disabled={loading} onClick={() => { setSource(""); setInstruction(""); setOutput(""); setError(""); setTouched(false); }}><Trash2 /> Clear</Button>
          </div>
        </Panel>

        <Panel className="flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Analysis</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generate} disabled={loading || !output}><RefreshCw /> Regenerate</Button>
              <CopyButton text={output} />
            </div>
          </div>
          {error && <ErrorNote message={error} />}
          {!output && !loading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Search className="size-8" />
              <p className="mt-2 text-sm">Overview, key findings, considerations and recommendations will appear here.</p>
            </div>
          ) : (
            <>
              {loading && <Thinking label="Analysing…" />}
              <textarea rows={20} className={cn(textareaCls, "flex-1")} value={output} onChange={(e) => setOutput(e.target.value)} aria-label="Research output" />
              <AINote />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
