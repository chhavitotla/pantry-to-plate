"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-chefmate-oat-deep/90 bg-[#fbf7ef]/95 shadow-[0_8px_24px_-22px_rgba(36,48,74,0.22)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/" onClick={closeMobileMenu}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chefmate-sage text-white shadow-soft">
            <span className="text-xl">🍳</span>
          </div>
          <div className="min-w-0 text-chefmate-ink">
            <p className="truncate font-display text-[1.8rem] font-bold leading-none tracking-[-0.04em] sm:text-[2.25rem]">
              Chef Mate
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/#preview">Recipes</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/#how-it-works">How It Works</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/about">About</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </nav>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="md:hidden"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-chefmate-oat-deep/80 bg-[#fbf7ef] md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/#preview" onClick={closeMobileMenu}>
                Recipes
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/#how-it-works" onClick={closeMobileMenu}>
                How It Works
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </Button>
            <Button asChild className="justify-start">
              <Link href="/app" onClick={closeMobileMenu}>
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
