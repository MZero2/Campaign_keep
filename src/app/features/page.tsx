import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  "Campaign dashboard con attività viva",
  "Wiki lore pubblico/privato",
  "Sessioni con recap e note master",
  "NPC, luoghi, oggetti e quest",
  "Handout e media archive",
  "Scheda personaggio D&D base",
  "Diario e note private del giocatore",
  "Permessi master/player e visibilità",
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="font-heading text-4xl text-neutral-100">Features</h1>
      <p className="mt-2 text-neutral-400">MVP v1 orientato a campagne D&D.</p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Core Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-neutral-300 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2">
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
