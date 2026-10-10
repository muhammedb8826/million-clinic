import type { StrapiHeader, StrapiTopHeader } from "@/lib/strapi";
import { MainNav } from "./MainNav";
import Link from "next/link";

interface MainHeaderProps {
  data: StrapiHeader | null;
  topHeader: StrapiTopHeader | null;
  siteName: string;
}

export function MainHeader({ data, topHeader, siteName }: MainHeaderProps) {
  if (!data) {
    return (
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-foreground">
            {siteName}
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <MainNav header={data} topHeader={topHeader} siteName={siteName} />
      </div>
    </header>
  );
}
