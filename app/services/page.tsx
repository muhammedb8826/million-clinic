import type { Metadata } from "next";
import { getServicePage } from "@/lib/strapi";
import { AboutBlocks } from "@/features/about";
import { PageBanner } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [fb, servicePage] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getServicePage({ revalidate: 60 }),
  ]);
  if (!servicePage) {
    return mergePageMetadata(fb, { title: "Services" });
  }
  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(servicePage.seo, {
      title: servicePage.title ?? servicePage.seo?.metaTitle ?? "Services",
    }),
  );
}

export default async function ServicesPage() {
  const servicePage = await getServicePage({ revalidate: 60 });

  if (!servicePage) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            Services page content is not available.
          </p>
        </div>
      </main>
    );
  }

  const title = servicePage.title?.trim() || servicePage.seo?.metaTitle?.trim() || "Services";
  const { banner, blocks = [] } = servicePage;
  const hasDynamicBlocks = blocks.length > 0;

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={banner}
        title={title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
        noBannerVariant="secondary"
      />
      {hasDynamicBlocks ? (
        <AboutBlocks blocks={blocks} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            No services content has been configured yet.
          </p>
        </div>
      )}
    </main>
  );
}
