interface PageIntroProps {
  text?: string | null;
}

export function PageIntro({ text }: PageIntroProps) {
  const value = typeof text === "string" ? text.trim() : "";
  if (!value) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <p className="text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        {value}
      </p>
    </section>
  );
}

