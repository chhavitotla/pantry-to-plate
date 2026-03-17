"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadRequestFromSession } from "@/lib/storage";
import type { RecommendPayload } from "@/types/api";

export default function NoMatchPage() {
  const [lastRequest, setLastRequest] = useState<RecommendPayload | null>(null);

  useEffect(() => {
    setLastRequest(loadRequestFromSession());
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Card className="w-full overflow-hidden bg-white/88">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-10">
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chefmate-plum/14 text-chefmate-plum">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-chefmate-terracotta">
                  No match this round
                </p>
                <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-chefmate-ink sm:text-5xl">
                  We checked every corner of the kitchen and your pantry is being dramatic today.
                </h1>
                <p className="text-lg leading-8 text-chefmate-muted">
                  Try loosening the rules a little, toss in one more ingredient, or switch the vibe.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[32px] bg-chefmate-oat p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chefmate-muted">
                  Last search
                </p>
                {lastRequest ? (
                  <div className="mt-4 space-y-2 text-chefmate-ink">
                    <p>
                      <span className="font-semibold">Pantry:</span>{" "}
                      {lastRequest.pantry_items.join(", ") || "None"}
                    </p>
                    <p>
                      <span className="font-semibold">Meal type:</span> {lastRequest.meal_type}
                    </p>
                    <p>
                      <span className="font-semibold">Dietary type:</span> {lastRequest.dietary_type}
                    </p>
                    <p>
                      <span className="font-semibold">Time:</span> {lastRequest.max_time_minutes} min
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-chefmate-muted">Run a search first to see the details here.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/app">
                    <RefreshCw className="h-4 w-4" />
                    Add one more thing
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/app">
                    <ArrowLeft className="h-4 w-4" />
                    Switch the vibe
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
