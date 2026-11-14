import type { Metadata } from "next";
import { getHomePage } from "@/lib/strapi";
import { AboutBlocks } from "@/features/about";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [fb, homePage] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getHomePage({ revalidate: 60 }),
  ]);
  const seo = homePage?.seo;
  return mergePageMetadata(fb, strapiSeoToOverrides(seo));
}

export default async function Home() {
  const homePage = await getHomePage({ revalidate: 60 });
  const blocks = homePage?.blocks ?? [];

  return (
    <main className="min-h-screen">
      {blocks.length > 0 ? (
        <AboutBlocks blocks={blocks} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            Home page content is not available.
          </p>
        </div>
      )}
    </main>
  );
}
