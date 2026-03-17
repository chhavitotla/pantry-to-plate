"use client";

import { Loader2, MessageCircleMore, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useRecipeChat } from "@/hooks/use-recipe-chat";
import type { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const suggestedQuestions = [
  "Make it tangy",
  "Make it spicy",
  "Add more protein",
  "Make it quicker",
  "What can I swap?",
];

type FollowUpBlock =
  | { type: "paragraph"; content: string }
  | { type: "bullet"; label?: string; content: string };

function cleanMarkdown(text: string) {
  return text.replace(/\*\*/g, "").trim();
}

function parseFollowUpAnswer(answer: string): FollowUpBlock[] {
  return answer
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bullet = line.match(/^\*\s*(.+)$/);
      if (!bullet) {
        return { type: "paragraph", content: cleanMarkdown(line) } as FollowUpBlock;
      }

      const body = cleanMarkdown(bullet[1]);
      const labelMatch = body.match(/^([^:]+):\s*(.+)$/);
      if (labelMatch) {
        return {
          type: "bullet",
          label: labelMatch[1].trim(),
          content: labelMatch[2].trim(),
        } as FollowUpBlock;
      }

      return { type: "bullet", content: body } as FollowUpBlock;
    });
}

export function RecipeFollowUpChat({ recipe }: { recipe: Recipe }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const recipeChatMutation = useRecipeChat();
  const parsedAnswer = answer ? parseFollowUpAnswer(answer) : [];

  async function askQuestion(customQuestion?: string) {
    const nextQuestion = (customQuestion ?? question).trim();
    if (!nextQuestion) {
      return;
    }

    try {
      const response = await recipeChatMutation.mutateAsync({
        recipe_id: recipe.recipe_id,
        question: nextQuestion,
      });
      setAnswer(response.answer);
      setQuestion(customQuestion ? "" : question);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ChefMate could not answer that recipe question.",
      );
    }
  }

  return (
    <Card className="bg-white">
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf0fb] text-chefmate-plum">
            <MessageCircleMore className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-terracotta">
              Ask ChefMate
            </p>
            <h3 className="font-display text-3xl font-bold tracking-[-0.04em] text-chefmate-ink">
              Want to tweak this recipe a little?
            </h3>
            <p className="max-w-2xl text-base leading-7 text-chefmate-muted">
              Ask about spice, tang, swaps, extra protein, or how to make this one fit your mood.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((item) => (
            <Button
              key={item}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => {
                void askQuestion(item);
              }}
              disabled={recipeChatMutation.isPending}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void askQuestion();
              }
            }}
            placeholder="How can I make this more saucy, spicy, or protein-rich?"
            className="h-13 flex-1"
          />
          <Button
            type="button"
            size="lg"
            className="sm:min-w-[168px]"
            onClick={() => {
              void askQuestion();
            }}
            disabled={recipeChatMutation.isPending}
          >
            {recipeChatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            Ask
          </Button>
        </div>

        {answer ? (
          <div className="rounded-[28px] border border-chefmate-oat-deep bg-[#fbf8f3] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
              Follow-up answer
            </p>
            <div className="mt-4 space-y-4">
              {parsedAnswer.map((block, index) => {
                if (block.type === "bullet") {
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      className="flex gap-3 rounded-[22px] bg-white/75 px-4 py-3"
                    >
                      <span className="mt-[0.7rem] h-2.5 w-2.5 shrink-0 rounded-full bg-chefmate-terracotta" />
                      <p className="text-base leading-8 text-chefmate-ink sm:text-lg">
                        {block.label ? (
                          <>
                            <span className="font-semibold text-chefmate-plum">{block.label}:</span>{" "}
                            {block.content}
                          </>
                        ) : (
                          block.content
                        )}
                      </p>
                    </div>
                  );
                }

                return (
                  <p
                    key={`${block.type}-${index}`}
                    className="text-lg leading-8 text-chefmate-ink"
                  >
                    {block.content}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
