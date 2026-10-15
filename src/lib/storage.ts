import { useEffect, useState } from "react";

export type Activity = { id: string; kind: "email" | "research" | "chat"; title: string; at: number };

const ACTIVITY_KEY = "wpa.activity";
const EVENT = "wpa-storage";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

export function addActivity(kind: Activity["kind"], title: string) {
  const list = readJSON<Activity[]>(ACTIVITY_KEY, []);
  list.unshift({ id: crypto.randomUUID(), kind, title: title.slice(0, 90), at: Date.now() });
  writeJSON(ACTIVITY_KEY, list.slice(0, 20));
}

export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("wpa."))
    .forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(EVENT));
}

export function useActivity() {
  const [list, setList] = useState<Activity[]>([]);
  useEffect(() => {
    const load = () => setList(readJSON<Activity[]>(ACTIVITY_KEY, []));
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  return list;
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
