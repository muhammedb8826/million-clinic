import type { Metadata } from "next";
import { getBoardMembers } from "@/lib/strapi";
import { BoardMemberCard } from "@/features/board-members";
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
    title: "Board Members",
    description: "Meet the leadership team driving our mission forward.",
  });
}

export default async function BoardMembersPage({ searchParams }: PageProps) {
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: members, meta } = await getBoardMembers({
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    revalidate: 60,
  });
  const pagination = meta?.pagination;
  const intro = "Meet the leadership team driving our mission forward.";

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title="Board Members"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Board Members" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={intro} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {members.length === 0 ? (
          <p className="text-muted-foreground">No board members yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
        <Pagination
          page={pagination?.page ?? page}
          pageCount={pagination?.pageCount ?? 1}
          basePath="/board-members"
        />
      </div>
    </main>
  );
}
