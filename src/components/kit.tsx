import type { ReactNode } from "react";
import { AlertCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>{children}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">
        {label} {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" /> {message}
    </div>
  );
}

export function Thinking({ label = "Generating…" }: { label?: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {label}
    </span>
  );
}

export function CopyButton({ text, size = "sm" }: { text: string; size?: "sm" | "icon" }) {
  return (
    <Button
      variant="outline"
      size={size}
      disabled={!text.trim()}
      onClick={() => copyText(text).then(() => toast.success("Copied to clipboard"), () => toast.error("Couldn't copy"))}
    >
      <Copy /> {size === "sm" && "Copy"}
    </Button>
  );
}

export function AINote() {
  return (
    <p className="text-xs text-muted-foreground">
      AI-generated — may contain inaccuracies. Review and verify before using.
    </p>
  );
}

export const textareaCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-relaxed shadow-sm outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring";
