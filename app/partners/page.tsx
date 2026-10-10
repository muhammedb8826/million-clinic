import type { Metadata } from "next";
import { getPartners } from "@/lib/strapi";
import { PartnerCard } from "@/features/partners";
import { PageBanner, PageIntro } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LIST_PAGE_SIZE, Pagination, parsePageParam } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const fb = await fetchSeoFallback({ revalidate: 60 });
  return mergePageMetadata(fb, {
    title: "Partners",
    description: "Organizations we collaborate with to extend our impact.",
  });
}

export default async function PartnersPage({ searchParams }: PageProps) {
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: partners, meta } = await getPartners({
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    revalidate: 60,
  });
  const pagination = meta?.pagination;
  const intro = "Organizations we collaborate with to extend our impact.";

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title="Partners"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Partners" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={intro} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {partners.length === 0 ? (
          <p className="text-muted-foreground">No partners yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
        <Pagination
          page={pagination?.page ?? page}
          pageCount={pagination?.pageCount ?? 1}
          basePath="/partners"
        />
      </div>
    </main>
  );
}
