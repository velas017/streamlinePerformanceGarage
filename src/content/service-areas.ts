import type { Faq, SeoFields } from "@/content/types";

/**
 * Cities we serve from the Concord shop that earn their own landing page. These
 * are NOT physical locations: they carry no address or LocalBusiness schema, only
 * honest "here's how far we are and why it's worth the drive" content.
 */
export const serviceAreaSlugs = ["charlotte"] as const;
export type ServiceAreaSlug = (typeof serviceAreaSlugs)[number];

export interface ServiceArea {
  readonly slug: ServiceAreaSlug;
  readonly name: string;
  readonly region: string;
  readonly headline: string;
  /** One line under the H1, e.g. drive time from the shop. */
  readonly lead: string;
  readonly intro: readonly string[];
  readonly neighborhoods: readonly string[];
  readonly faqs: readonly Faq[];
  readonly seo: SeoFields;
}

export const serviceAreas = [
  {
    slug: "charlotte",
    name: "Charlotte",
    region: "NC",
    headline: "Japanese Car Repair & Tuning for Charlotte, NC Drivers",
    lead: "Our shop is in Concord, roughly 20 minutes up I-85 from Uptown Charlotte and even closer to University City, Harrisburg and the north side of town.",
    intro: [
      "A large share of the Subarus, Nissans and Hondas in our bays come from Charlotte. Drivers make the short trip up I-85 because they want a shop that works on their platform every day, explains what it finds with data, and does not treat an enthusiast car like an appliance.",
      "Whether you are in University City, NoDa, South End or out toward Huntersville and Lake Norman, we are an easy morning drop-off: get on I-85 North, take the Concord Mills / Speedway exit, and you are minutes from the shop. Book online, tell us what you drive, and we will confirm a time.",
    ],
    neighborhoods: [
      "Uptown",
      "University City",
      "NoDa",
      "Plaza Midwood",
      "South End",
      "Ballantyne",
      "Huntersville",
      "Cornelius",
      "Matthews",
      "Mint Hill",
      "Harrisburg",
      "Lake Norman",
    ],
    faqs: [
      {
        question: "How far is the shop from Charlotte?",
        answer:
          "About 20 minutes from Uptown via I-85 North, and 10 to 15 minutes from University City or Harrisburg. We are just off the interstate near Charlotte Motor Speedway.",
      },
      {
        question: "Can I drop my car off early or leave it overnight?",
        answer:
          "Yes. Tell us when you book and we will arrange an early drop-off or an overnight stay so the trip from Charlotte fits your schedule.",
      },
      {
        question: "Do you offer pickup or delivery in Charlotte?",
        answer:
          "Not as a standard service, but ask when you book. For larger jobs like engine work or dyno tuning we can often help coordinate transport.",
      },
    ],
    seo: {
      title: "Charlotte, NC Japanese Car Repair & Tuning",
      description:
        "Japanese car repair, alignments, suspension and dyno tuning for Charlotte, NC drivers. Subaru, Nissan and Honda specialists 20 minutes up I-85 in Concord.",
      keywords: [
        "Japanese car mechanic Charlotte NC",
        "Subaru specialist Charlotte",
        "Nissan repair Charlotte NC",
        "Honda performance shop Charlotte",
      ],
    },
  },
] as const satisfies readonly ServiceArea[];

export function getServiceArea(slug: string): ServiceArea | undefined {
  return serviceAreas.find((area) => area.slug === slug);
}
