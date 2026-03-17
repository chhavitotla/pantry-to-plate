import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-chefmate-oat-deep/70 bg-[#fbf7ef]/92">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
            <span className="text-xl">🍳</span>
            <span className="font-display text-2xl font-bold tracking-[-0.04em] text-chefmate-ink">
              Chef Mate
            </span>
          </div>
          <p className="max-w-md text-sm leading-7 text-chefmate-muted">
            Calm help for tired evenings, mystery fridges, and those tiny kitchen standoffs where
            everyone just stares at the rice.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
            Explore
          </p>
          <div className="flex flex-col gap-2 text-sm text-chefmate-muted">
            <Link className="transition hover:text-chefmate-ink" href="/">
              Home
            </Link>
            <Link className="transition hover:text-chefmate-ink" href="/app">
              Find my meal
            </Link>
            <Link className="transition hover:text-chefmate-ink" href="/about">
              About
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
            Tiny print
          </p>
          <div className="space-y-2 text-sm text-chefmate-muted">
            <p>Built for quick decisions, not recipe doomscrolling.</p>
            <p>© {year} ChefMate. Made with spice, structure, and a little kitchen chaos.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
