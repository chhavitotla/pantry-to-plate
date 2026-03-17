import Link from "next/link";
import { ArrowRight, HeartHandshake, Soup } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-chefmate-oat-deep bg-white/85 px-4 py-2 text-sm text-chefmate-muted">
            <HeartHandshake className="h-4 w-4 text-chefmate-terracotta" />
            Why ChefMate exists
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-chefmate-ink sm:text-6xl">
              ChefMate is for the moment when your energy is low, but you still want to eat well.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-chefmate-muted">
              It isn&apos;t trying to be a giant recipe catalog. It&apos;s a decision engine that helps
              you move from “what can I cook?” to “okay, that actually sounds good” without turning
              dinner into another task on the list.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="bg-white/80">
              <CardContent className="space-y-4 p-6">
                <Soup className="h-6 w-6 text-chefmate-plum" />
                <h2 className="text-2xl font-semibold text-chefmate-ink">Not a recipe website</h2>
                <p className="leading-7 text-chefmate-muted">
                  ChefMate is meant to answer one question well: what can I cook right now with what
                  I already have?
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80">
              <CardContent className="space-y-4 p-6">
                <HeartHandshake className="h-6 w-6 text-chefmate-terracotta" />
                <h2 className="text-2xl font-semibold text-chefmate-ink">Built to feel calm</h2>
                <p className="leading-7 text-chefmate-muted">
                  The interface is warm, quick, and low-pressure, because dinner after work should
                  not feel like admin.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-chefmate-oat-deep/90 bg-gradient-to-r from-[#f4ecde] via-[#fbf8f2] to-[#e7efe9]">
            <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                  Last call
                </p>
                <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-chefmate-ink sm:text-4xl">
                  Your fridge can stop acting mysterious now.
                </h2>
                <p className="text-base leading-7 text-chefmate-muted sm:text-lg sm:leading-8">
                  Toss in what you have, keep the rules honest, and let ChefMate do the calm part.
                </p>
              </div>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/app">
                  Start cooking with ChefMate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
