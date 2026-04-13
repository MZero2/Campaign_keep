import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  { name: "Player Premium", price: "9,99 €/mese", description: "Diario avanzato e strumenti personali estesi." },
  { name: "Master Premium", price: "14,99 €/mese", description: "Gestione campagna completa e capacità espansa." },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="font-heading text-4xl text-neutral-100">Pricing Hypothesis</h1>
      <p className="mt-2 text-neutral-400">Struttura indicativa da validare dopo MVP.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-amber-300">{plan.price}</p>
              <p className="mt-2 text-sm text-neutral-400">{plan.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
