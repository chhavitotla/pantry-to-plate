import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyResultsPanel() {
  return (
    <Card className="border-chefmate-plum/20 bg-[#fffafc]">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chefmate-plum/12 text-chefmate-plum">
          <SearchX className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-chefmate-ink">
            Your pantry is being dramatic today.
          </h3>
          <p className="max-w-2xl text-base leading-7 text-chefmate-muted">
            We checked the kitchen roster and nothing quite matched this combo. Try one more
            ingredient or switch the vibe a little.
          </p>
        </div>
        <Button asChild>
          <Link href="/no-match">Help me recover</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
