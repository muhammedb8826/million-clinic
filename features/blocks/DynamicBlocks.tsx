import type { StrapiDynamicBlock } from "@/lib/strapi";
import { AboutBlocks } from "@/features/about";

export function DynamicBlocks({ blocks }: { blocks: StrapiDynamicBlock[] | null | undefined }) {
  return <AboutBlocks blocks={blocks} />;
}

