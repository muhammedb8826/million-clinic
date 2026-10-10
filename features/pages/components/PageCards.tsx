import type { StrapiPageCard } from "@/lib/strapi";

const CARD_ICON_SIZE = 28;

function IconSvg({ icon }: { icon: { iconData?: string; width?: number; height?: number } }) {
  if (!icon?.iconData) return null;
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  return (
    <svg
      width={CARD_ICON_SIZE}
      height={CARD_ICON_SIZE}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: icon.iconData }}
    />
  );
}

interface PageCardsProps {
  cards: StrapiPageCard[];
}

export function PageCards({ cards }: PageCardsProps) {
  if (!cards?.length) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md hover:border-primary/50"
            >
              {card.icon && (
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <IconSvg icon={card.icon} />
                </span>
              )}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
