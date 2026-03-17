"use client";

import { useEffect, useState } from "react";

import { heroWords } from "@/lib/constants";

export function HeroHeadlineRotator() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = heroWords[index];

    const isWordComplete = displayed === currentWord;
    const isWordDeleted = displayed === "";
    const nextDelay = isDeleting ? 44 : isWordComplete ? 1200 : 82;

    const timeout = window.setTimeout(() => {
      if (!isDeleting && !isWordComplete) {
        setDisplayed(currentWord.slice(0, displayed.length + 1));
        return;
      }

      if (!isDeleting && isWordComplete) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && !isWordDeleted) {
        setDisplayed(currentWord.slice(0, displayed.length - 1));
        return;
      }

      setIsDeleting(false);
      setIndex((value) => (value + 1) % heroWords.length);
    }, nextDelay);

    return () => window.clearTimeout(timeout);
  }, [displayed, index, isDeleting]);

  return (
    <span className="inline-flex min-h-[1.1em] min-w-[14ch] items-center text-chefmate-terracotta">
      <span>{displayed}</span>
      <span className="ml-1 inline-block h-[0.9em] w-[3px] animate-pulse rounded-full bg-chefmate-plum" />
    </span>
  );
}
