import type { Metadata } from "next";
import { getHomePage, getArticles, getGlobal, getPartners } from "@/lib/strapi";
import { Slider, FeaturedArticles, FeaturedProjects, FeaturedEvents, FeaturedPartners, MissionSection, VideoSection } from "@/features/home";
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
  const [homePage, global, partnersResponse] = await Promise.all([
    getHomePage({ revalidate: 60 }),
    getGlobal({ revalidate: 60 }),
    getPartners({ pageSize: 50, revalidate: 60 }),
  ]);

  const slides = homePage?.slides ?? [];
  const blocks = homePage?.blocks ?? [];
  const hasDynamicBlocks = blocks.length > 0;
  let articles = homePage?.articles ?? [];
  if (articles.length === 0) {
    const featuredResponse = await getArticles({ featured: true, pageSize: 6, revalidate: 60 });
    articles = featuredResponse.data ?? [];
  }
  if (articles.length === 0) {
    const latestResponse = await getArticles({ pageSize: 6, revalidate: 60 });
    articles = latestResponse.data ?? [];
  }

  const projects = homePage?.projects ?? [];
  const events = homePage?.events ?? [];
  const partners = partnersResponse?.data ?? [];
  const siteName = global?.siteName ?? undefined;
  const siteDescription = global?.siteDescription ?? undefined;

  return (
    <main className="min-h-screen">
      {hasDynamicBlocks ? (
        <AboutBlocks blocks={blocks} />
      ) : (
        <>
          {slides.length > 0 && <Slider slides={slides} />}
          {slides.length === 0 && (
            <div className="mx-auto max-w-6xl px-4 py-12">
              <p className="text-center text-muted-foreground">
                No slides configured for the home page.
              </p>
            </div>
          )}
          <MissionSection
            siteName={siteName}
            siteDescription={siteDescription}
            aboutSection={homePage?.aboutSection ?? null}
          />
          {(homePage?.video || homePage?.videoURL) && (
            <VideoSection video={homePage.video ?? null} videoURL={homePage.videoURL} />
          )}
        </>
      )}
      <FeaturedArticles articles={articles} />
      {events.length > 0 && <FeaturedEvents events={events} />}
      {projects.length > 0 && <FeaturedProjects projects={projects} />}
      {partners.length > 0 && <FeaturedPartners partners={partners} />}
    </main>
  );
}
