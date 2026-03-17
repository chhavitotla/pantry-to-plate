import { Clock3, Soup } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { titleCase } from "@/lib/formatters";
import type { RecommendPayload } from "@/types/api";

export function ResultsToolbar({
  count,
  payload,
}: {
  count: number;
  payload: RecommendPayload;
}) {
  return (
    <Card className="bg-white/80">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chefmate-terracotta">
            Tonight&apos;s lineup
          </p>
          <p className="mt-2 text-lg font-semibold text-chefmate-ink">
            {count} recipe{count === 1 ? "" : "s"} looking pretty solid
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="plum" className="gap-2">
            <Soup className="h-3.5 w-3.5" />
            {titleCase(payload.meal_type)}
          </Badge>
          <Badge variant="sage" className="gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            {payload.max_time_minutes} min max
          </Badge>
          <Badge>{titleCase(payload.dietary_type)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
