import type { Metadata } from "next";
import { getAboutPage } from "@/lib/strapi";
import { AboutVideo, AboutOrganization, AboutBlocks } from "@/features/about";
import { PageBanner } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [fb, aboutPage] = await Promise.all([fetchSeoFallback({ revalidate: 60 }), getAboutPage({ revalidate: 60 })]);
  if (!aboutPage) {
    return mergePageMetadata(fb, { title: "About" });
  }
  return mergePageMetadata(fb, strapiSeoToOverrides(aboutPage.seo, { title: aboutPage.title }));
}

export default async function AboutPage() {
  const aboutPage = await getAboutPage({ revalidate: 60 });

  if (!aboutPage) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            About page content is not available.
          </p>
        </div>
      </main>
    );
  }

  const { banner, video, title, blocks = [], bocks = [] } = aboutPage;
  const orgBlock = bocks.find(
    (b): b is typeof b & { __component: "components.about-organization" } =>
      b?.__component === "components.about-organization"
  );
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
        <>
          {video && <AboutVideo video={video} />}
          {orgBlock && <AboutOrganization block={orgBlock} />}
        </>
      )}
    </main>
  );
}
