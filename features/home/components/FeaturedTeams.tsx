import Link from "next/link";
import { TeamCard } from "@/features/teams";
import type { StrapiTeam } from "@/lib/strapi";

interface FeaturedTeamsProps {
  teams: StrapiTeam[];
  title?: string | null;
  subTitle?: string | null;
}

export function FeaturedTeams({ teams, title, subTitle }: FeaturedTeamsProps) {
  if (!teams?.length) return null;

  const display = teams.slice(0, 6);
  const heading = title?.trim() || null;
  const description = subTitle?.trim() || null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {(heading || description) && (
          <div className="mb-10 max-w-2xl md:mb-12">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]">
                {heading}
              </h2>
            )}
            {description && (
              <p className={`max-w-xl text-muted-foreground ${heading ? "mt-3" : ""}`}>
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {display.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            View all team members
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
