import type { StrapiAboutOrganizationBlock, StrapiAboutCard } from "@/lib/strapi";

function IconSvg({ icon }: { icon: { iconData?: string; width?: number; height?: number } }) {
  if (!icon?.iconData) return null;
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: icon.iconData }}
    />
  );
}

function AboutCard({ card }: { card: StrapiAboutCard }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md hover:border-primary/50">
      {card.icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <IconSvg icon={card.icon} />
        </span>
      )}
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {card.title}
      </h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {card.description}
      </p>
    </div>
  );
}

interface AboutOrganizationProps {
  block: StrapiAboutOrganizationBlock;
}

export function AboutOrganization({ block }: AboutOrganizationProps) {
  const { title, cards = [] } = block;

  if (cards.length === 0 && !title) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        {title && (
          <h2 className="mb-12 max-w-3xl text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {title}
          </h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <AboutCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
