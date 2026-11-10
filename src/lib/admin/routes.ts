import type { Route } from "next";

/**
 * Every admin page: "/admin", "/admin/sign-in", … (query strings included).
 * Derived from the route files by typedRoutes, so a link or redirect to an
 * admin page that does not exist fails `npm run typecheck`.
 */
export type AdminRoute = Extract<Route, `/admin${string}`>;
