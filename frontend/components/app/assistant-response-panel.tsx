import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AssistantBlock =
  | { type: "title"; content: string }
  | { type: "section"; content: string }
  | { type: "bullet"; content: string }
  | { type: "step"; content: string; index: string }
  | { type: "paragraph"; content: string };

function parseAssistantMessage(message: string): AssistantBlock[] {
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: AssistantBlock[] = [];

  lines.forEach((line, index) => {
    const boldMatch = line.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      blocks.push({
        type: index === 0 ? "title" : "section",
        content: boldMatch[1].trim(),
      });
      return;
    }

    const bulletMatch = line.match(/^\*\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: "bullet", content: bulletMatch[1].trim() });
      return;
    }

    const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch) {
      blocks.push({
        type: "step",
        index: stepMatch[1],
        content: stepMatch[2].trim(),
      });
      return;
    }

    blocks.push({ type: "paragraph", content: line });
  });

  return blocks;
}

export function AssistantResponsePanel({ message }: { message: string }) {
  const blocks = parseAssistantMessage(message);

  return (
    <Card className="border-chefmate-saffron/60 bg-[#fffdf3]">
      <CardContent className="p-6 sm:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chefmate-saffron/20 text-[#9c6d0d]">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chefmate-saffron">
              ChefMate&apos;s nudge
            </p>

            <div className="space-y-4">
              {blocks.map((block, index) => {
                if (block.type === "title") {
                  return (
                    <h3
                      key={`${block.type}-${index}`}
                      className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-chefmate-ink sm:text-4xl"
                    >
                      {block.content}
                    </h3>
                  );
                }

                if (block.type === "section") {
                  return (
                    <h4
                      key={`${block.type}-${index}`}
                      className="pt-2 text-lg font-semibold text-chefmate-ink sm:text-xl"
                    >
                      {block.content}
                    </h4>
                  );
                }

                if (block.type === "bullet") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="flex gap-3 text-base leading-8 text-chefmate-ink sm:text-lg"
                    >
                      <span className="mt-[0.6rem] h-2.5 w-2.5 shrink-0 rounded-full bg-chefmate-terracotta" />
                      <p>{block.content}</p>
                    </div>
                  );
                }

                if (block.type === "step") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="flex gap-4 rounded-[22px] bg-white/65 px-4 py-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chefmate-plum text-sm font-semibold text-white">
                        {block.index}
                      </div>
                      <p className="text-base leading-8 text-chefmate-ink sm:text-lg">
                        {block.content}
                      </p>
                    </div>
                  );
                }

                return (
                  <p
                    key={`${block.type}-${index}`}
                    className="text-base leading-8 text-chefmate-ink sm:text-lg"
                  >
                    {block.content}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
