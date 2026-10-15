import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Search, MessagesSquare, ArrowRight, Clock } from "lucide-react";
import { Panel } from "@/components/kit";
import { useActivity } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your AI-powered workspace for emails, research and everyday work questions." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, research topics and chat with an AI workplace assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", text: "Create professional, context-aware emails in seconds." },
  { to: "/research", icon: Search, title: "AI Research Assistant", text: "Summarise information, identify key insights, and generate recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "AI Workplace Chat", text: "Ask questions, solve problems, and get assistance with everyday professional tasks." },
] as const;

const ICONS = { email: Mail, research: Search, chat: MessagesSquare };
const LINKS = { email: "/email", research: "/research", chat: "/chat" } as const;

function Dashboard() {
  const activity = useActivity();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Your AI-powered workspace</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Draft emails, make sense of long documents and get practical answers to everyday work questions — so you
          spend less time on routine writing and more on the work that matters.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group">
            <Panel className="h-full transition-colors group-hover:border-ring/50">
              <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Panel>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-3 space-y-2">
            {[
              { to: "/email", label: "Write a follow-up email" },
              { to: "/research", label: "Summarise a pasted article" },
              { to: "/chat", label: "Help me prioritise my workload" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm hover:bg-secondary">
                {a.label} <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Panel>
        <Panel className="lg:col-span-3">
          <h3 className="font-semibold">Recent activity</h3>
          {activity.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <Clock className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground">Emails, research and chats you create will appear here.</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y">
              {activity.slice(0, 8).map((a) => {
                const Icon = ICONS[a.kind];
                return (
                  <li key={a.id}>
                    <Link to={LINKS[a.kind]} className="flex items-center gap-3 py-2.5 text-sm hover:text-primary">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{a.title}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
