import type { LocationId } from "@/lib/site-config";

export interface Testimonial {
  readonly name: string;
  readonly vehicle: string;
  readonly location: LocationId;
  /** Where the customer drives in from; shown after the vehicle. */
  readonly hometown: string;
  readonly quote: string;
  /** 1–5 */
  readonly rating: 1 | 2 | 3 | 4 | 5;
}

/**
 * TODO(owner): replace with real, permissioned customer reviews (Google reviews
 * are a good source). Fabricated reviews must never ship; these placeholders exist
 * only to develop the layout.
 */
export const testimonials = [
  {
    name: "Marcus T.",
    vehicle: "2015 Nissan GT-R",
    location: "concord",
    hometown: "Huntersville",
    rating: 5,
    quote:
      "They found a boost leak two other shops missed, then tuned the car with a real explanation of every change. The dyno sheet and datalogs came with it. This is the only shop touching my GT-R now.",
  },
  {
    name: "Priya R.",
    vehicle: "2019 Subaru WRX STI",
    location: "concord",
    hometown: "Charlotte",
    rating: 5,
    quote:
      "Ringland failure at 60k. Streamline rebuilt the EJ with a full build sheet and walked me through the break-in. A year and two track days later it is running perfectly. Worth the drive up I-85.",
  },
  {
    name: "Devon L.",
    vehicle: "1999 Nissan Skyline GT-R R34",
    location: "concord",
    hometown: "Kannapolis",
    rating: 5,
    quote:
      "Bringing a fresh import to a shop that actually knows right-hand-drive cars made all the difference. They sourced OEM parts from Japan and had it road-ready in two weeks.",
  },
  {
    name: "Hannah K.",
    vehicle: "2008 Honda S2000",
    location: "concord",
    hometown: "University City",
    rating: 5,
    quote:
      "Valve adjustment, clutch and coilovers with a proper alignment. Fair pricing, clear communication and the car feels new. Fifteen minutes from University City, easy drop-off.",
  },
  {
    name: "Jordan M.",
    vehicle: "1994 Toyota Supra Turbo",
    location: "concord",
    hometown: "Harrisburg",
    rating: 5,
    quote:
      "Single-turbo conversion and E85 tune. They planned the whole fuel system before ordering a single part, and the car made the number they said it would.",
  },
] as const satisfies readonly Testimonial[];
