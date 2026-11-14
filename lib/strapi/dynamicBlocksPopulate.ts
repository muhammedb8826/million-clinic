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
          slides: {
            populate: {
              media: { populate: "*" },
              link: { populate: "*" },
            },
          },
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
      "section.cta": {
        populate: {
          link: { populate: "*" },
          backgroundImage: { populate: "*" },
        },
      },
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
      "section.news": {
        populate: {
          articles: {
            populate: {
              cover: { populate: "*" },
              category: { populate: "*" },
            },
          },
        },
      },
      "section.projects": {
        populate: {
          projects: {
            populate: {
              cover: { populate: "*" },
              banner: { populate: "*" },
            },
          },
        },
      },
      "section.partners": {
        populate: {
          partners: {
            populate: {
              logo: { populate: "*" },
            },
          },
        },
      },
      "section.events": {
        populate: {
          events: {
            populate: {
              cover: { populate: "*" },
              category: { populate: "*" },
              location: { populate: "*" },
              organizer: {
                populate: {
                  photo: { populate: "*" },
                  socialLinks: { populate: "*" },
                },
              },
            },
          },
        },
      },
      "section.teams": {
        populate: {
          teams: {
            populate: {
              photo: { populate: "*" },
              socialLinks: { populate: "*" },
            },
          },
        },
      },
      "shared.media": { populate: "*" },
      "shared.quote": { populate: "*" },
      "shared.rich-text": { populate: "*" },
      "shared.slider": {
        populate: {
          media: { populate: "*" },
          link: { populate: "*" },
        },
      },
    },
  } as const;
}
