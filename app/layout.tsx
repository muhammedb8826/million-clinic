import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { TopHeader, MainHeader, getHeaderData } from "@/features/header";
import { mergePageMetadata } from "@/lib/seo/metadata";
import { Footer } from "@/features/footer";
import { ThemeProvider } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const LOCALE_COOKIE = "NEXT_LOCALE";
const RTL_CODES = new Set(["ar"]);

const GOOGLE_SITE_VERIFICATION = "IkfA0-l6fy-mGEk2lwJXc4Yn6vT4Ubt1zqeixbMkyhg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function resolveMetadataBase(): URL | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!raw) return undefined;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol);
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = resolveMetadataBase();
  const baseFields = metadataBase ? { metadataBase } : {};

  try {
    const headerData = await getHeaderData();
    return {
      ...baseFields,
      verification: { google: GOOGLE_SITE_VERIFICATION },
      ...mergePageMetadata(
        headerData
          ? {
              defaultSeo: headerData.defaultSeo,
              siteName: headerData.siteName,
              siteDescription: headerData.siteDescription,
            }
          : null,
        {},
      ),
    };
  } catch {
    return {
      ...baseFields,
      verification: { google: GOOGLE_SITE_VERIFICATION },
      ...mergePageMetadata(null, {}),
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerData = await getHeaderData();
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value ?? "en";
  const dir = RTL_CODES.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={cn("font-sans", figtree.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TopHeader data={headerData?.topHeader ?? null} />
          <MainHeader
            data={headerData?.header ?? null}
            topHeader={headerData?.topHeader ?? null}
            siteName={headerData?.siteName ?? "Charity"}
          />
          {children}
          <Footer data={headerData?.footer ?? null} />
        </ThemeProvider>
      </body>
    </html>
  );
}
