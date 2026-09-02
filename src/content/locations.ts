import type { Faq, SeoFields } from "@/content/types";
import type { LocationId } from "@/lib/site-config";

export interface LocationContent {
  readonly headline: string;
  readonly intro: readonly string[];
  readonly neighborhoods: readonly string[];
  readonly directions: string;
  readonly faqs: readonly Faq[];
  readonly seo: SeoFields;
}

export const locationContent: Record<LocationId, LocationContent> = {
  concord: {
    headline: "Japanese Automotive Specialists in Concord, NC",
    intro: [
      "Streamline Performance Garage is an independent shop in Concord, North Carolina that works on Japanese cars and nothing else. Subaru, Nissan and Honda make up most of what is on the lifts, alongside Toyota, Mazda, Mitsubishi and Lexus. Alignments, suspension, brakes, wheels and tires, maintenance, diagnostics, engine and transmission work and dyno tuning all happen here.",
      "We are just off I-85 near Charlotte Motor Speedway, which puts us within an easy drive of Kannapolis, Harrisburg, Huntersville and the whole north side of Charlotte. Enthusiasts drive in from across the metro because they want technicians who know their platform and a shop that explains its work.",
    ],
    neighborhoods: [
      "Downtown Concord",
      "Afton Village",
      "Concord Mills",
      "Kannapolis",
      "Harrisburg",
      "Mount Pleasant",
      "Midland",
      "Salisbury",
      "University City",
    ],
    /** TODO(owner): confirm the turn-by-turn wording. */
    directions:
      "From I-85, take the Concord Mills / Speedway Boulevard exit and head toward Charlotte Motor Speedway. Grand National Lane SW is a few minutes from the exit; look for the Streamline Performance Garage sign.",
    faqs: [
      {
        question: "Do you have an alignment rack and a dyno on site?",
        answer:
          "Yes. Performance alignments are done in-house on our rack, and dyno tuning is available for platforms we support. Call ahead for dyno scheduling so we can plan the session.",
      },
      {
        question: "Can I wait at the shop?",
        answer:
          "Yes. There is seating and Wi-Fi in the lobby, and downtown Concord and Concord Mills are a short drive if you would rather grab lunch during a longer job.",
      },
      {
        question: "Do you take walk-ins?",
        answer:
          "We prioritize booked appointments so we can give every car proper time. Call or use the booking form and we will fit you in as soon as possible, often the same week.",
      },
    ],
    seo: {
      title: "Concord, NC Japanese Automotive Specialists",
      description:
        "Japanese automotive specialists in Concord, NC: alignments, suspension, brakes, maintenance, diagnostics and dyno tuning for Subaru, Nissan and Honda.",
      keywords: [
        "Japanese car repair Concord NC",
        "Subaru mechanic Concord NC",
        "alignment shop Concord NC",
        "dyno tuning Concord NC",
        "import performance shop Cabarrus County",
      ],
    },
  },
};
