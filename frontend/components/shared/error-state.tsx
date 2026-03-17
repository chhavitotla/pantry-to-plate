import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-chefmate-terracotta/20 bg-white/85">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-chefmate-terracotta/12 text-chefmate-terracotta">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-chefmate-ink">Something interrupted the dinner plan.</p>
            <p className="text-sm text-chefmate-muted">{message}</p>
          </div>
        </div>
        {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
      </CardContent>
    </Card>
  );
}
