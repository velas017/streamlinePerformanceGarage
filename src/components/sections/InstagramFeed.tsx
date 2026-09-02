import { InstagramCarousel } from "@/components/sections/InstagramCarousel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getInstagramPosts, instagramProfileUrl } from "@/lib/instagram";
import { siteConfig } from "@/lib/site-config";

/**
 * Server component: fetches the business account's recent posts (ISR, 1 hour)
 * and renders the carousel, or a follow card when the feed is off/unavailable.
 */
export async function InstagramFeed() {
  const posts = await getInstagramPosts();
  const handle = siteConfig.instagramHandle;

  return (
    <Section id="instagram" labelledBy="instagram-heading">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          id="instagram-heading"
          eyebrow={`@${handle}`}
          title="Latest from the shop floor"
          description="Builds, dyno pulls and what is on the lift this week."
          className="mb-0 sm:mb-0"
        />
        <Button
          href={instagramProfileUrl}
          variant="secondary"
          size="sm"
          icon="arrow-right"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          Follow on Instagram
          <span className="sr-only"> (opens in a new tab)</span>
        </Button>
      </div>

      <div className="mt-8 sm:mt-10">
        {posts.length > 0 ? (
          <InstagramCarousel posts={posts} handle={handle} />
        ) : (
          <Card className="items-start">
            <Icon name="camera" className="size-8 text-accent" />
            <p className="text-lg text-fg">
              Follow <span className="font-semibold">@{handle}</span> for build photos,
              dyno numbers and shop updates.
            </p>
            <p className="text-sm text-muted">
              Recent posts appear here automatically once the Instagram feed is connected.
            </p>
          </Card>
        )}
      </div>
    </Section>
  );
}
