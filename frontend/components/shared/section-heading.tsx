export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-chefmate-sage">
        {eyebrow}
      </p>
      <h2 className="font-display text-5xl font-bold leading-[0.96] tracking-[-0.04em] text-chefmate-ink sm:text-6xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-chefmate-muted sm:text-lg">{description}</p>
    </div>
  );
}
