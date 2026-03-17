import { PiggyBank, Salad, ShoppingBasket } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: PiggyBank,
    title: "Save money by cooking at home",
    tone: "A little less takeout. A little more calm.",
    className: "bg-[#e7dfff]",
  },
  {
    icon: Salad,
    title: "Eat healthier without planning meals",
    tone: "No spreadsheets. No Sunday prep guilt.",
    className: "bg-[#fbd7e4]",
  },
  {
    icon: ShoppingBasket,
    title: "Use what you already have",
    tone: "Turn pantry odds and ends into dinner.",
    className: "bg-[#d9f3ea]",
  },
];

export function ValuePillars() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {pillars.map((pillar, index) => (
        <Reveal key={pillar.title} delay={index * 90}>
          <Card className={`border-white/80 ${pillar.className}`}>
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-chefmate-plum">
                <pillar.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-chefmate-ink">{pillar.title}</h3>
                <p className="text-sm leading-6 text-chefmate-muted">{pillar.tone}</p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
