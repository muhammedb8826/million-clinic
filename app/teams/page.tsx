import type { Metadata } from "next";
import { getTeams } from "@/lib/strapi";
import { TeamCard } from "@/features/teams";
import { PageBanner, PageIntro } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LIST_PAGE_SIZE, Pagination, parsePageParam } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const fb = await fetchSeoFallback({ revalidate: 60 });
  return mergePageMetadata(fb, {
    title: "Team",
    description: "Meet the team driving our mission forward.",
  });
}

export default async function TeamsPage({ searchParams }: PageProps) {
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: members, meta } = await getTeams({
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    revalidate: 60,
  });
  const pagination = meta?.pagination;
  const intro = "Meet the team driving our mission forward.";

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title="Team"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Team" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={intro} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {members.length === 0 ? (
          <p className="text-muted-foreground">No team members yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        )}
        <Pagination
          page={pagination?.page ?? page}
          pageCount={pagination?.pageCount ?? 1}
          basePath="/teams"
        />
      </div>
    </main>
  );
}
