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
      <CardContent className="p-4 sm:p-7">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chefmate-saffron/20 text-[#9c6d0d] sm:h-12 sm:w-12">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-4 sm:space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chefmate-saffron">
              ChefMate&apos;s nudge
            </p>

            <div className="space-y-3.5 sm:space-y-4">
              {blocks.map((block, index) => {
                if (block.type === "title") {
                  return (
                    <h3
                      key={`${block.type}-${index}`}
                      className="break-words font-display text-2xl font-bold leading-tight tracking-[-0.03em] text-chefmate-ink sm:text-4xl"
                    >
                      {block.content}
                    </h3>
                  );
                }

                if (block.type === "section") {
                  return (
                    <h4
                      key={`${block.type}-${index}`}
                      className="pt-1 text-lg font-semibold text-chefmate-ink sm:pt-2 sm:text-xl"
                    >
                      {block.content}
                    </h4>
                  );
                }

                if (block.type === "bullet") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="flex gap-3 text-sm leading-7 text-chefmate-ink sm:text-lg sm:leading-8"
                    >
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-chefmate-terracotta sm:mt-[0.6rem]" />
                      <p className="break-words">{block.content}</p>
                    </div>
                  );
                }

                if (block.type === "step") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded-[20px] bg-white/65 px-3 py-3 sm:grid-cols-[2.5rem_1fr] sm:gap-4 sm:rounded-[22px] sm:px-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chefmate-plum text-sm font-semibold text-white">
                        {block.index}
                      </div>
                      <p className="break-words text-sm leading-7 text-chefmate-ink sm:text-lg sm:leading-8">
                        {block.content}
                      </p>
                    </div>
                  );
                }

                return (
                  <p
                    key={`${block.type}-${index}`}
                    className="break-words text-sm leading-7 text-chefmate-ink sm:text-lg sm:leading-8"
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
