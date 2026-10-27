import { isAuthorizedCronRequest } from "@/lib/cron";
import { refreshInstagramToken } from "@/lib/instagram-token";

/** Weekly Vercel Cron job (vercel.json) that keeps the Instagram token alive. */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await refreshInstagramToken();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
