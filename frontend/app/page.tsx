import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Salad, Sparkles, Wallet } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featureCards = [
  {
    icon: Clock3,
    title: "Quick answers",
    description: "Move from tired to cooking in under twenty seconds.",
  },
  {
    icon: Salad,
    title: "Healthier dinners",
    description: "Use what you have without falling back to takeout.",
  },
  {
    icon: Wallet,
    title: "Less food waste",
    description: "Put forgotten ingredients to work before they expire.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8efe4] px-5 py-3 text-sm font-semibold text-chefmate-sage">
                <Sparkles className="h-4 w-4" />
                checkmate to your decision fatigue
              </div>

              <div className="space-y-5">
                <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-chefmate-ink sm:text-6xl lg:text-[5.6rem]">
                  Staring at your fridge like it owes &ldquo;you&rdquo; an answer?
                </h1>
                <p className="max-w-2xl text-xl leading-9 text-chefmate-muted">
                  ChefMate turns your random fridge lineup into a meal idea that actually sounds
                  good. Pantry to plate, no scrolling spiral required.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="min-w-[210px]">
                  <Link href="/app">
                    Find My Meal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/meal-plan" className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-chefmate-terracotta" />
                    Plan My Week
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-chefmate-muted">
                <div className="flex -space-x-3">
                  {["👩‍🍳", "🧑‍🍳", "🍜", "🥑"].map((item) => (
                    <div
                      key={item}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-chefmate-oat-deep bg-white text-xl"
                    >
                      {item}
                    </div>
                  ))}
                </div>
               
              </div>
            </Reveal>

            <Reveal delay={120}>
              <Card className="overflow-hidden rounded-[40px] border-chefmate-oat-deep/90 bg-white">
                <CardContent className="space-y-6 p-5 sm:p-6">
                  <div className="rounded-[34px] border border-chefmate-oat-deep bg-[#fbf8f3] p-5">
                    <div className="flex flex-wrap gap-3">
                      {["Eggs", "Tomatoes", "Garlic", "Onion"].map((item) => (
                        <div
                          key={item}
                          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-chefmate-ink shadow-sm"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-[30px] bg-gradient-to-br from-[#fffdf8] to-[#f3ecdf] p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                        ChefMate answer
                      </p>
                      <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] text-chefmate-ink">
                        Desi Masala Macaroni
                      </h2>
                      <p className="mt-3 text-lg leading-8 text-chefmate-muted">
                        Fast, cozy, and made from what you already had lying around tonight.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {["25 min", "Vegetarian", "One pot"].map((tag) => (
                          <div
                            key={tag}
                            className="rounded-full border border-chefmate-oat-deep bg-white px-4 py-2 text-sm font-medium text-chefmate-ink"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {featureCards.slice(0, 2).map((card) => (
                      <div key={card.title} className="rounded-[28px] border border-chefmate-oat-deep bg-[#fffdfa] p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-chefmate-sage">
                          <card.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-6 font-display text-3xl font-bold tracking-[-0.03em] text-chefmate-ink">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-chefmate-muted">
                          {card.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <section id="preview" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Preview"
              title="Simple enough to trust after a long day."
              description="ChefMate is not a giant recipe maze. It is the fast, calm answer for the moment when you want one good dinner idea and zero extra effort."
            />
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal delay={80}>
              <Card className="overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="relative h-[320px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f59d20] to-[#f27b1f]">
                    <div className="absolute left-8 top-8 rounded-full bg-white px-5 py-3 text-lg font-semibold text-chefmate-ink shadow-soft">
                      Comfort
                    </div>
                    <div className="absolute right-8 top-8 rounded-full bg-white px-5 py-3 text-lg font-semibold text-chefmate-ink shadow-soft">
                      Quick
                    </div>
                    <div className="absolute bottom-8 left-8 max-w-sm rounded-[30px] bg-white/88 p-6 backdrop-blur-sm">
                      <h3 className="font-display text-4xl font-bold tracking-[-0.04em] text-chefmate-ink">
                        Soft egg ramen
                      </h3>
                      <p className="mt-2 text-base leading-7 text-chefmate-muted">
                        Pantry comfort when you want something warm and fast.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <div className="grid gap-5">
              {featureCards.map((card, index) => (
                <Reveal key={card.title} delay={120 + index * 90}>
                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2eb] text-chefmate-sage">
                        <card.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 font-display text-3xl font-bold tracking-[-0.03em] text-chefmate-ink">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-lg leading-8 text-chefmate-muted">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Three soft steps. One clear meal decision."
              description="The flow is quick, conversational, and built to feel more like a recommendation than a chore."
            />
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                number: "01",
                title: "Add ingredients",
                text: "Start with whatever is actually in your kitchen right now.",
              },
              {
                number: "02",
                title: "Set your mood",
                text: "Pick the vibe, timing, and any non-negotiables for tonight.",
              },
              {
                number: "03",
                title: "Cook with confidence",
                text: "Get a recipe card that feels picked for you, not dumped from a list.",
              },
            ].map((step, index) => (
              <Reveal key={step.title} delay={index * 100}>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                      {step.number}
                    </div>
                    <h3 className="mt-6 font-display text-4xl font-bold tracking-[-0.04em] text-chefmate-ink">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-lg leading-8 text-chefmate-muted">{step.text}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <Card className="overflow-hidden bg-gradient-to-r from-[#f4ecde] via-[#f9f5ec] to-[#e7efe9]">
              <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                    Start now
                  </p>
                  <h2 className="mt-3 font-display text-5xl font-bold tracking-[-0.05em] text-chefmate-ink">
                    Use what you have. Cook something good.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-chefmate-muted">
                    Good dinner decisions should take seconds, not a full identity crisis.
                  </p>
                </div>
                <Button asChild size="lg" className="min-w-[210px]">
                  <Link href="/app">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}