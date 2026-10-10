interface PageQuoteProps {
  quote: string | null | undefined;
}

export function PageQuote({ quote }: PageQuoteProps) {
  if (!quote?.trim()) return null;

  return (
    <blockquote className="my-12 border-l-4 border-primary bg-muted py-6 pl-6 pr-8">
      <p className="text-lg italic leading-relaxed text-muted-foreground">{quote}</p>
    </blockquote>
  );
}
