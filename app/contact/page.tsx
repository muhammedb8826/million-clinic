import type { Metadata } from "next";
import { getContactPage } from "@/lib/strapi";
import { PageBanner } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { ContactPageBody } from "@/features/contact";

export async function generateMetadata(): Promise<Metadata> {
  const [fb, contactPage] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getContactPage({ revalidate: 60 }),
  ]);
  if (!contactPage) {
    return mergePageMetadata(fb, { title: "Contact" });
  }
  return mergePageMetadata(fb, strapiSeoToOverrides(contactPage.seo, { title: contactPage.title }));
}

export default async function ContactPage() {
  const contactPage = await getContactPage({ revalidate: 60 });

  if (!contactPage) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-muted-foreground">
            Contact page content is not available.
          </p>
        </div>
      </main>
    );
  }

  const { banner, title } = contactPage;

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={banner}
        title={title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: title ?? "Contact" },
        ]}
        noBannerVariant="secondary"
      />
      <ContactPageBody page={contactPage} />
    </main>
  );
}
