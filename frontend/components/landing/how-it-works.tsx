import { ArrowRight, Refrigerator, SmilePlus, UtensilsCrossed } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Add ingredients",
    icon: Refrigerator,
    description: "Drop in whatever is already sitting in your kitchen.",
    className: "bg-white",
  },
  {
    number: "02",
    title: "Choose your mood",
    icon: SmilePlus,
    description: "Set the kind of meal you want without overthinking it.",
    className: "bg-[#fff8dc]",
  },
  {
    number: "03",
    title: "Get a recipe instantly",
    icon: UtensilsCrossed,
    description: "ChefMate gives you a real answer fast, not endless browsing.",
    className: "bg-[#dff5ed]",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {steps.map((step, index) => (
        <Reveal key={step.title} delay={index * 110}>
          <Card className={`relative overflow-hidden border-white/80 ${step.className}`}>
            <CardContent className="flex h-full flex-col gap-5 p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-extrabold text-chefmate-oat-deep">
                  {step.number}
                </span>
                <step.icon className="h-6 w-6 text-chefmate-plum" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-chefmate-ink">{step.title}</h3>
                <p className="text-sm leading-6 text-chefmate-muted">{step.description}</p>
              </div>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute bottom-5 right-5 hidden h-5 w-5 text-chefmate-muted/40 lg:block" />
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
