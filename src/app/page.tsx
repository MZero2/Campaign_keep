import Link from "next/link";
import { BookOpen, Shield, Swords } from "lucide-react";

import { getSessionUser } from "@/lib/auth";

const valuePillars = [
  {
    title: "Campaign Brain",
    text: "Wiki, lore, sessions, NPCs, quests, handouts and archive in one living space.",
    icon: BookOpen,
  },
  {
    title: "Player Life",
    text: "Character sheet + private diary + personal notes without jumping across apps.",
    icon: Shield,
  },
  {
    title: "Party Home",
    text: "Shared campaign dashboard with role-based visibility and clean module navigation.",
    icon: Swords,
  },
];

export default async function Home() {
  const sessionUser = await getSessionUser();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="app-frame relative overflow-hidden rounded-2xl px-8 py-14 sm:px-12">
        <div className="mb-6 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
          D&D Campaign Platform
        </div>
        <h1 className="font-heading text-4xl leading-tight text-neutral-50 sm:text-5xl">
          Campaign Keep
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-300">
          Il posto unico dove il gruppo vive la campagna: gestione master, spazio giocatore e schede
          personaggio in un ecosistema solo.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={sessionUser ? "/dashboard" : "/register"}
            className="rounded-md bg-amber-500 px-5 py-2.5 font-semibold text-neutral-950 hover:bg-amber-400"
          >
            {sessionUser ? "Open Dashboard" : "Start Free"}
          </Link>
          <Link
            href={sessionUser ? "/dashboard" : "/login"}
            className="rounded-md border border-neutral-600 bg-neutral-900 px-5 py-2.5 text-neutral-100 hover:bg-neutral-800"
          >
            {sessionUser ? "Continue Campaign" : "Login"}
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {valuePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article key={pillar.title} className="rounded-xl border border-neutral-800 bg-neutral-950/65 p-5">
              <Icon className="mb-4 h-5 w-5 text-amber-300" />
              <h2 className="font-heading text-xl text-neutral-100">{pillar.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{pillar.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
