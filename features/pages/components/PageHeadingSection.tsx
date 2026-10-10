interface PageHeadingSectionProps {
  heading: string | null | undefined;
  subHeading: string | null | undefined;
}

export function PageHeadingSection({ heading, subHeading }: PageHeadingSectionProps) {
  if (!heading?.trim() && !subHeading?.trim()) return null;

  return (
    <section className="relative overflow-hidden bg-muted py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--primary)_0.06,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {heading && (
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {heading}
          </h2>
        )}
        {subHeading && (
          <p className="mt-4 text-lg text-muted-foreground">
            {subHeading}
          </p>
        )}
      </div>
    </section>
  );
}
