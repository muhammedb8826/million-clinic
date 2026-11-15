/**
 * Server-only Strapi API helpers (uses next/headers for locale).
 * Client components must import media/types from `@/lib/strapi` instead.
 */
import "server-only";

export { strapiFetch, buildPopulateParams } from "./fetcher";
export type { StrapiFetcherOptions } from "./fetcher";
export { getGlobal } from "./global";
export { getHomePage } from "./homePage";
export { getAboutPage } from "./aboutPage";
export { getContactPage } from "./contactPage";
export { getDonatePage } from "./donatePage";
export { getServicePage } from "./servicePage";
export { getPages, getPageBySlug } from "./pages";
export { getProjects, getProjectBySlug } from "./projects";
export { getPartners, getPartnerBySlug } from "./partners";
export { getArticles, getArticleBySlug } from "./articles";
export { getAdjacentItems } from "./adjacent";
export type { AdjacentItem } from "./adjacent";
export { getArticleCategories } from "./articleCategories";
export { getTeams, getTeamBySlug } from "./teams";
export {
  getEvents,
  getEventBySlug,
  getRelatedEventsByCategory,
} from "./eventsApi";
