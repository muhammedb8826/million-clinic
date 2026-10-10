export function dynamicBlocksPopulate() {
  return {
    on: {
      "section.content": { populate: "*" },
      "section.gallery": { populate: "*" },
      "section.tab-section": {
        populate: {
          tabs: {
            populate: {
              featuredCard: { populate: "*" },
              link: { populate: "*" },
              textContent: { populate: "*" },
            },
          },
        },
      },
      "components.slides": {
        populate: {
          slides: { populate: "*" },
        },
      },
      "section.stats": {
        populate: {
          stats: { populate: "*" },
        },
      },
      "section.testimonials": {
        populate: {
          testimonials: { populate: "*" },
        },
      },
      "section.cta": { populate: "*" },
      "section.features": {
        populate: {
          features: { populate: "*" },
        },
      },
      "section.accordions": {
        populate: {
          items: { populate: "*" },
        },
      },
      "section.video-section": {
        populate: {
          video: { populate: "*" },
        },
      },
      "section.cards": {
        populate: {
          cards: { populate: "*" },
        },
      },
      "shared.media": { populate: "*" },
      "shared.quote": { populate: "*" },
      "shared.rich-text": { populate: "*" },
      "shared.slider": { populate: "*" },
    },
  } as const;
}

