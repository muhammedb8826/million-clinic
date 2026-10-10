import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/strapi";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { Slider } from "@/features/home";
import { DynamicBlocks } from "@/features/blocks";
import {
  PageBanner,
  PageIntro,
  RichTextContent,
  PageQuote,
  PageHeadingSection,
  PageCards,
  PageMedia,
} from "@/features/pages";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, page] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getPageBySlug(slug, { revalidate: 60 }),
  ]);
  if (!page) {
    return mergePageMetadata(fb, { title: "Page" });
  }
  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(page.seo, { title: page.title, description: page.subTitle ?? undefined }),
  );
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug, { revalidate: 60 });

  if (!page) notFound();

  const {
    title,
    subTitle,
    banner,
    blocks,
    richText,
    quote,
    heading,
    subHeading,
    slides,
    cards,
    media,
  } = page;

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={banner}
        title={title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: title ?? "Page" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={subTitle} />
      {(heading || subHeading) && (
        <PageHeadingSection heading={heading} subHeading={subHeading} />
      )}
      {slides && slides.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <Slider slides={slides} />
        </div>
      )}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {blocks && blocks.length > 0 && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <DynamicBlocks blocks={blocks} />
          </div>
        )}
        {richText && richText.length > 0 && (
          <div className={blocks?.length ? "mt-10" : ""}>
            <RichTextContent content={richText} />
          </div>
        )}
        {quote && (
          <div className={blocks?.length || richText?.length ? "mt-8" : ""}>
            <PageQuote quote={quote} />
          </div>
        )}
      </div>
      {cards && cards.length > 0 && <PageCards cards={cards} />}
      {media && <PageMedia media={media} />}
    </main>
  );
}
