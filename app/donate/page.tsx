import type { Metadata } from "next";
import { getDonatePage } from "@/lib/strapi";
import { AboutBlocks } from "@/features/about";
import { PageBanner } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [fb, donatePage] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getDonatePage({ revalidate: 60 }),
  ]);
  if (!donatePage) {
    return mergePageMetadata(fb, {
      title: "Donate",
      description: "Support our mission with a one-time or recurring donation.",
    });
  }
  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(donatePage.seo, {
      title: donatePage.title ?? donatePage.seo?.metaTitle ?? "Donate",
    }),
  );
}

export default async function DonatePage() {
  const donatePage = await getDonatePage({ revalidate: 60 });

  if (!donatePage) {
    return (
      <main className="min-h-screen">
        <PageBanner
          banner={null}
          title="Donate"
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Donate" },
          ]}
          noBannerVariant="secondary"
        />
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            Donate page content is not available.
          </p>
        </div>
      </main>
    );
  }

  const title = donatePage.title?.trim() || donatePage.seo?.metaTitle?.trim() || "Donate";
  const blocks = donatePage.blocks ?? [];

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={donatePage.banner ?? null}
        title={title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
        noBannerVariant="secondary"
      />
      {blocks.length > 0 ? (
        <AboutBlocks blocks={blocks} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            No donation options have been configured yet.
          </p>
        </div>
      )}
    </main>
  );
}
