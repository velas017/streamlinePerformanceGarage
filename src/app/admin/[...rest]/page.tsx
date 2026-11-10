import { notFound } from "next/navigation";

/**
 * Any other address on the admin host. Sending it to notFound() here keeps the
 * 404 inside the admin layout (admin/not-found.tsx) instead of the public
 * site's 404 page, whose links do not exist on this hostname.
 */
export default function AdminCatchAll() {
  notFound();
}
