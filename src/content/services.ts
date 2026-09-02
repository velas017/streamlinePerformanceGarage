import type { IconName } from "@/components/ui/Icon";
import type { Faq, SeoFields } from "@/content/types";

export const serviceSlugs = [
  "performance-tuning",
  "turbo-and-supercharger-installs",
  "engine-builds",
  "suspension-and-alignment",
  "wheels-and-tires",
  "brake-upgrades",
  "scheduled-maintenance",
  "diagnostics",
  "pre-purchase-inspections",
  "jdm-import-service",
  "drivetrain-and-clutch",
  "exhaust-and-intake",
  "track-prep",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export interface Service {
  readonly slug: ServiceSlug;
  readonly name: string;
  /** Short label for nav and cards. */
  readonly shortName: string;
  readonly icon: IconName;
  /** One-sentence card summary. */
  readonly summary: string;
  /** Body copy paragraphs for the service page. */
  readonly description: readonly string[];
  readonly highlights: readonly string[];
  readonly faqs: readonly Faq[];
  readonly related: readonly ServiceSlug[];
  readonly seo: SeoFields;
  /** Show on the home page grid. */
  readonly featured: boolean;
}

export const services = [
  {
    slug: "performance-tuning",
    name: "Performance & ECU Tuning",
    shortName: "ECU Tuning",
    icon: "gauge",
    featured: true,
    summary:
      "Dyno-proven ECU calibration for boosted and naturally aspirated Japanese platforms, from a safe daily map to a full E85 setup.",
    description: [
      "A tune is only as good as the data behind it. Every calibration at Streamline Performance Garage starts with a baseline pull, a leak-down and boost-leak check, and a datalog review so we are tuning a healthy car, not masking a problem. We work with EcuTek, HP Tuners, Cobb Accessport, Hondata, Haltech and Link, so whether you drive a GT-R, a WRX STI, a Civic Type R or a Supra, we are tuning on the platform your car was built for.",
      "Street and E85 flex-fuel calibrations are done in-house in Concord, with dyno time for wide-open-throttle work. You leave with a datalog, a before-and-after graph, and a map that is conservative where it needs to be and aggressive where it counts.",
    ],
    highlights: [
      "Baseline dyno pull and health check before any calibration",
      "EcuTek, Cobb, Hondata, HP Tuners, Haltech and Link supported",
      "Street, E85 and flex-fuel maps with datalog review",
      "Before-and-after dyno graphs included with every tune",
    ],
    faqs: [
      {
        question: "Do I need supporting mods before a tune?",
        answer:
          "Not always. A stock or lightly modified car still gains drivability and throttle response from a proper calibration. If your goals call for more airflow or fuel, we will tell you exactly what supports the number you want before we start.",
      },
      {
        question: "Can you tune E85 or flex fuel?",
        answer:
          "Yes. We build flex-fuel calibrations for most Subaru, Nissan, Toyota and Honda platforms, and we install ethanol content sensors in-house.",
      },
      {
        question: "Will a tune void my warranty?",
        answer:
          "Software changes can affect powertrain warranty coverage on newer cars. We will walk you through what is reversible on your platform so you can make an informed decision.",
      },
    ],
    related: ["turbo-and-supercharger-installs", "exhaust-and-intake", "diagnostics"],
    seo: {
      title: "ECU & Performance Tuning",
      description:
        "Dyno-proven ECU tuning for Japanese sports cars in Concord, NC near Charlotte. EcuTek, Cobb, Hondata and HP Tuners maps for GT-R, WRX STI, Supra and Type R.",
      keywords: [
        "ECU tuning Concord NC",
        "dyno tuning Charlotte NC",
        "Subaru tune Charlotte",
      ],
    },
  },
  {
    slug: "turbo-and-supercharger-installs",
    name: "Turbo & Supercharger Installs",
    shortName: "Forced Induction",
    icon: "turbo",
    featured: true,
    summary:
      "Bolt-on turbo upgrades, big single conversions and supercharger kits, installed with the fuel system and tune to support them.",
    description: [
      "Forced induction is where a lot of shops cut corners. We size the turbo or blower to your goals, then build the whole system around it: injectors, fuel pump, intercooler, oil and coolant lines, wastegate and boost control. Everything is pressure-tested before the car ever sees the dyno.",
      "We regularly install upgraded turbos on the R35 GT-R, 370Z and Z, WRX STI and Supra, and supercharger kits on the S2000, GR86 and BRZ, Miata and NSX. If you bring a kit you already bought, we will inspect it first and tell you honestly whether it is worth putting on the car.",
    ],
    highlights: [
      "Turbo sizing and fuel system planning for your power goal",
      "Pressure and leak testing before the first dyno pull",
      "Supercharger kits for S2000, GR86 / BRZ, Miata and NSX",
      "Complete install and calibration under one roof",
    ],
    faqs: [
      {
        question: "How much power can my car handle on a stock engine?",
        answer:
          "It depends on the platform. We publish safe targets for the common Japanese platforms we work on and will review your specific engine, mileage and history before recommending a number.",
      },
      {
        question: "Do you install customer-supplied kits?",
        answer:
          "Yes, after inspecting the parts. We will let you know if anything is missing, mismatched or unsafe before we start the install.",
      },
      {
        question: "How long does a turbo install take?",
        answer:
          "Most bolt-on upgrades are two to four days including the tune. Single-turbo conversions with fuel system work run one to two weeks depending on parts. We give you a written timeline before starting.",
      },
    ],
    related: ["performance-tuning", "engine-builds", "exhaust-and-intake"],
    seo: {
      title: "Turbo & Supercharger Installs",
      description:
        "Turbo and supercharger installs for Nissan, Subaru, Toyota and Honda sports cars, installed and tuned by import specialists in Concord, NC near Charlotte.",
    },
  },
  {
    slug: "engine-builds",
    name: "Engine Builds & Rebuilds",
    shortName: "Engine Builds",
    icon: "engine",
    featured: true,
    summary:
      "Forged short blocks, built long blocks and precision rebuilds for VR38, EJ, FA, 2JZ, RB, SR and K-series engines.",
    description: [
      "From a ringland-failed EJ257 to a 1,000-horsepower VR38DETT, we build engines that are measured, documented and blueprinted. Every block is cleaned, magnafluxed, bored and honed with a torque plate, and every rotating assembly is balanced. We keep a full build sheet with clearances and torque values that goes home with the car.",
      "Engine assembly happens in a dedicated area of our Concord shop, and we source components from brands we trust: Manley, CP-Carrillo, JE, King, ACL, Cometic, ARP and OEM where OEM is the right answer.",
    ],
    highlights: [
      "Torque-plate bore and hone, balanced rotating assemblies",
      "Full build sheet with clearances and torque specs",
      "Forged and OEM-plus builds for street, drag and road course",
      "Break-in service and post-build dyno available",
    ],
    faqs: [
      {
        question: "How long does an engine build take?",
        answer:
          "Most builds run four to eight weeks depending on machine-shop turnaround and parts availability. We give you a written timeline and update you at each milestone.",
      },
      {
        question: "Do you warranty engine builds?",
        answer:
          "Yes. Assembly workmanship is warrantied, and we provide a break-in procedure and a follow-up inspection after the first 500 miles.",
      },
      {
        question: "Can you rebuild a rotary?",
        answer:
          "Yes. We rebuild 13B engines for the RX-7 and RX-8, including porting and upgraded apex seals.",
      },
    ],
    related: [
      "turbo-and-supercharger-installs",
      "performance-tuning",
      "drivetrain-and-clutch",
    ],
    seo: {
      title: "Engine Builds & Rebuilds",
      description:
        "Forged engine builds and precision rebuilds for GT-R, WRX STI, Supra, RX-7 and Civic Type R in Concord, NC. Documented, balanced and dyno-verified builds.",
    },
  },
  {
    slug: "suspension-and-alignment",
    name: "Suspension & Performance Alignment",
    shortName: "Suspension",
    icon: "suspension",
    featured: true,
    summary:
      "Coilovers, sway bars, bushings and corner-balanced alignments set up for how and where you actually drive.",
    description: [
      "Good suspension is a system, not a parts list. We install and set up coilovers from KW, Öhlins, Fortune Auto, BC Racing and Tein, then align the car to a spec built around your tires, ride height and use. Street, autocross, road course and drift all call for different numbers, and we will explain every one of them.",
      "Alignments are done in-house on our rack in Concord, and we have scales for corner balancing. We also replace worn OEM bushings, ball joints and top hats on higher-mileage cars, because a 20-year-old 350Z or Integra will never feel right on new dampers with tired rubber.",
    ],
    highlights: [
      "Coilover install, ride height and damping setup",
      "Performance alignment specs for street, autocross and track",
      "Corner balancing on scales, in-house",
      "Bushing, ball joint and bearing replacement",
    ],
    faqs: [
      {
        question: "Do I need an alignment after coilovers?",
        answer:
          "Yes, every time ride height changes. Camber, toe and thrust angle all move with height, and skipping the alignment ruins tires and handling.",
      },
      {
        question: "Can you align a lowered car?",
        answer:
          "Yes. Our racks handle low, wide and long-wheelbase cars, and we carry camber and toe correction hardware for most Japanese platforms.",
      },
      {
        question: "What is a corner balance?",
        answer:
          "It is the process of adjusting each spring perch so the car's weight is split evenly across diagonal pairs of wheels. It makes handling symmetrical and is worth it on any track car.",
      },
    ],
    related: ["brake-upgrades", "track-prep", "scheduled-maintenance"],
    seo: {
      title: "Suspension & Alignment",
      description:
        "Coilover installs, performance alignments and corner balancing for Japanese sports cars in Concord, NC near Charlotte. KW, Öhlins and Fortune Auto setups.",
    },
  },
  {
    slug: "wheels-and-tires",
    name: "Wheels & Tires",
    shortName: "Wheels & Tires",
    icon: "tire",
    featured: true,
    summary:
      "Wheel and tire fitment, mounting and balancing, TPMS service and fitment advice for lowered and wide-body Japanese cars.",
    description: [
      "Fitment on a lowered WRX, a wide-body 350Z or a track-prepped Civic is not a chart lookup. We measure offset, backspacing and clearance on your car, then mount and road-force balance the set so it is smooth at highway speed and quiet in the cabin.",
      "We install and service TPMS sensors, source tires from Michelin, Continental, Bridgestone, Falken, Yokohama and Toyo for street and track, and pair every set with a performance alignment so new rubber actually lasts.",
    ],
    highlights: [
      "Fitment checks for offset, clearance and rolled fenders",
      "Mounting and road-force balancing for street and track sets",
      "TPMS sensor install and programming",
      "Alignment with every new set",
    ],
    faqs: [
      {
        question: "Can you mount tires on wheels I bought online?",
        answer:
          "Yes. Bring the wheels and tires, or have them shipped to the shop, and we will inspect, mount, balance and install them.",
      },
      {
        question: "Do you sell tires?",
        answer:
          "Yes. We source most major performance brands and will recommend a compound based on how and where you drive.",
      },
    ],
    related: ["suspension-and-alignment", "brake-upgrades", "track-prep"],
    seo: {
      title: "Wheels & Tires",
      description:
        "Wheel and tire fitment, mounting, balancing and TPMS service in Concord, NC near Charlotte. Fitment advice for lowered Subaru, Nissan and Honda builds.",
    },
  },
  {
    slug: "brake-upgrades",
    name: "Brake Upgrades & Service",
    shortName: "Brakes",
    icon: "brake",
    featured: true,
    summary:
      "Big brake kits, track pads, stainless lines and high-temp fluid, plus honest advice on what your car really needs.",
    description: [
      "Most street cars do not need a big brake kit; they need the right pads, fresh fluid and lines that do not swell. Track cars are a different story. We help you spend where it matters, from a pad-and-fluid refresh on a daily-driven WRX to a full StopTech, AP Racing or Brembo kit on a GT-R or Supra.",
      "Every brake job includes a rotor runout check, caliper slide inspection and a proper bleed with high-temperature fluid. We bed pads in before you leave so the first hard stop is predictable.",
    ],
    highlights: [
      "Big brake kits from StopTech, AP Racing and Brembo",
      "Track and street pad compounds for every platform",
      "Stainless lines and high-temp fluid flush",
      "Pads bedded in before hand-off",
    ],
    faqs: [
      {
        question: "Do I need a big brake kit for track days?",
        answer:
          "Often not. Many Japanese sports cars do well with track pads, stainless lines, ducting and good fluid. We will assess your car and your goals before recommending a kit.",
      },
      {
        question: "How often should brake fluid be changed?",
        answer:
          "Every two years for street use, and before every track weekend for cars that see hard use.",
      },
    ],
    related: ["suspension-and-alignment", "track-prep", "scheduled-maintenance"],
    seo: {
      title: "Brake Upgrades & Service",
      description:
        "Big brake kits, track pads and brake service for Japanese sports cars in Concord, NC near Charlotte. StopTech, AP Racing and Brembo installs and pad bedding.",
    },
  },
  {
    slug: "scheduled-maintenance",
    name: "Scheduled Maintenance",
    shortName: "Maintenance",
    icon: "wrench",
    featured: true,
    summary:
      "Factory-schedule service done by technicians who know these cars: fluids, timing components, spark plugs, filters and inspections.",
    description: [
      "Dealer-quality maintenance without the dealer. We follow the factory schedule for your car and use OEM or better fluids and parts, with a few platform-specific additions that the book leaves out, like more frequent transmission and differential service on the GT-R or early valve adjustments on the S2000.",
      "Every service visit includes a multi-point inspection with photos so you know what is wearing before it fails. Oil changes, timing belts and chains, spark plugs, coolant, brake fluid, transmission fluid, differential fluid, filters and belts are all handled in-house.",
    ],
    highlights: [
      "Factory-schedule service with OEM or better fluids",
      "Platform-specific extras dealers skip",
      "Photo multi-point inspection with every visit",
      "Same-day appointments available for routine work",
    ],
    faqs: [
      {
        question: "Do you service cars that are still under warranty?",
        answer:
          "Yes. Federal law allows you to service your car at an independent shop without voiding the manufacturer's warranty. We keep detailed records for you.",
      },
      {
        question: "Which oil do you use?",
        answer:
          "OEM-spec or better for your platform, including Motul, Mobil 1 and factory fluids where the manufacturer specification calls for them.",
      },
    ],
    related: ["diagnostics", "brake-upgrades", "pre-purchase-inspections"],
    seo: {
      title: "Scheduled Maintenance",
      description:
        "Factory-schedule maintenance for Nissan, Toyota, Subaru, Honda, Mazda and Lexus sports cars in Concord, NC near Charlotte. OEM fluids and photo inspections.",
    },
  },
  {
    slug: "diagnostics",
    name: "Diagnostics & Repair",
    shortName: "Diagnostics",
    icon: "activity",
    featured: false,
    summary:
      "Check engine lights, misfires, boost leaks, electrical gremlins and noises, diagnosed with factory-level tools and fixed right.",
    description: [
      "A code is a starting point, not a diagnosis. Our technicians use factory-level scan tools, smoke machines, oscilloscopes and datalogging to find the actual cause, whether it is a boost leak on a WRX, a failing cam sensor on a 2JZ or a corroded ground on a 30-year-old RX-7.",
      "You get a clear explanation, a photo or datalog of the fault, and a written estimate before any repair begins.",
    ],
    highlights: [
      "Factory-level scan tools for every Japanese make we serve",
      "Boost-leak, smoke and electrical testing",
      "Written estimate and evidence before repair",
    ],
    faqs: [
      {
        question: "How much does a diagnostic cost?",
        answer:
          "We charge a flat diagnostic fee that is credited toward the repair if you have us do the work. Call the shop for current pricing.",
      },
    ],
    related: ["scheduled-maintenance", "performance-tuning", "pre-purchase-inspections"],
    seo: {
      title: "Diagnostics & Repair",
      description:
        "Check engine light and performance diagnostics for Japanese cars in Concord, NC near Charlotte. Factory-level tools, written estimates and honest repairs.",
    },
  },
  {
    slug: "pre-purchase-inspections",
    name: "Pre-Purchase Inspections",
    shortName: "Pre-Purchase Inspection",
    icon: "clipboard-check",
    featured: false,
    summary:
      "Know exactly what you are buying. Compression, leak-down, boost leak, frame and mod audit with a photo report before you pay.",
    description: [
      "Modified Japanese cars can hide expensive problems behind clean paint. Our pre-purchase inspection covers compression and leak-down, boost-leak testing on turbo cars, a full underbody and frame check, a modification audit and a road test with datalogging.",
      "You receive a photo report with findings ranked by urgency and a realistic repair estimate you can use to negotiate. Sellers can drop the car at our Concord shop.",
    ],
    highlights: [
      "Compression, leak-down and boost-leak testing",
      "Frame, rust and prior-repair inspection",
      "Modification audit and datalogged road test",
      "Photo report you can use to negotiate",
    ],
    faqs: [
      {
        question: "Can the seller drop the car off?",
        answer:
          "Yes. The seller can drop the car at our Concord shop, and we will send the report directly to you.",
      },
    ],
    related: ["diagnostics", "jdm-import-service", "scheduled-maintenance"],
    seo: {
      title: "Pre-Purchase Inspections",
      description:
        "Pre-purchase inspections for used Japanese sports cars and JDM imports in Concord, NC near Charlotte. Compression, leak-down, frame check and photo report.",
    },
  },
  {
    slug: "jdm-import-service",
    name: "JDM Import Service",
    shortName: "JDM Imports",
    icon: "globe",
    featured: true,
    summary:
      "Right-hand-drive Skylines, Silvias, Chasers and Kei cars: post-import inspection, US-road prep, parts sourcing and ongoing service.",
    description: [
      "Freshly imported JDM cars need more than an oil change. We perform a full post-import inspection, address the common issues that come with 25-year-old cars that sat in a container, and handle US-road prep like headlight and lighting corrections, speedometer conversions and tire replacement.",
      "We maintain relationships with Japanese parts suppliers and can source OEM and Nismo, TRD, STI and Mugen components for R32, R33 and R34 Skylines, S13 to S15 Silvias, JZX Chasers and Mark IIs, and other right-hand-drive imports.",
    ],
    highlights: [
      "Post-import inspection and US-road prep",
      "Right-hand-drive experience across Nissan, Toyota and Honda",
      "Japan parts sourcing including Nismo, TRD, STI and Mugen",
      "Ongoing maintenance for 25-year-rule imports",
    ],
    faqs: [
      {
        question: "Can you help with NC titling for an imported car?",
        answer:
          "We are not a broker, but we can perform the inspections your titling process requires and point you to the importers we work with regularly.",
      },
      {
        question: "Do you work on right-hand-drive cars?",
        answer: "Yes. A large share of the cars in our shops are right-hand drive.",
      },
    ],
    related: ["pre-purchase-inspections", "scheduled-maintenance", "engine-builds"],
    seo: {
      title: "JDM Import Service",
      description:
        "JDM import specialists in Concord, NC near Charlotte. Post-import inspection, US-road prep, Japan parts sourcing and service for Skyline, Silvia and Chaser.",
    },
  },
  {
    slug: "drivetrain-and-clutch",
    name: "Drivetrain & Clutch",
    shortName: "Drivetrain",
    icon: "cog",
    featured: false,
    summary:
      "Clutches, flywheels, limited-slip differentials, axles and transmission rebuilds for manual and dual-clutch Japanese platforms.",
    description: [
      "Whether you need a stock replacement clutch on a Miata, a twin-disc on a Supra or a GR6 transmission service on a GT-R, we have done it many times. We also install and set up limited-slip differentials from OS Giken, Cusco and Kaaz, and rebuild transmissions with upgraded synchros and carbon-lined components.",
      "Every clutch job includes a flywheel inspection, pilot and throw-out bearing replacement and a hydraulic system bleed, so you are not back in a month for a squeal we could have prevented.",
    ],
    highlights: [
      "Clutch and flywheel packages for street and track",
      "Limited-slip differential install and setup",
      "GT-R GR6 service and dual-clutch transmission fluid service",
      "Manual transmission rebuilds",
    ],
    faqs: [
      {
        question: "Which clutch should I choose?",
        answer:
          "We match clutch torque capacity and pedal feel to your power level and how you drive. Most street cars are happiest one step above stock rather than a race clutch.",
      },
    ],
    related: ["engine-builds", "track-prep", "scheduled-maintenance"],
    seo: {
      title: "Drivetrain & Clutch",
      description:
        "Clutch, flywheel, limited-slip differential and transmission service for Japanese sports cars in Concord, NC near Charlotte, including GT-R GR6 service.",
    },
  },
  {
    slug: "exhaust-and-intake",
    name: "Exhaust & Intake",
    shortName: "Exhaust & Intake",
    icon: "wind",
    featured: false,
    summary:
      "Cat-back and turbo-back exhausts, headers, downpipes and intakes, fitted cleanly and tuned so they actually add power.",
    description: [
      "An intake and exhaust are the first mods most owners make, and they are also the ones most often installed poorly. We fit systems from HKS, Tomei, Invidia, Borla, AWE and Injen with proper hanger alignment, heat management and leak-free joints, and we retune where the change calls for it.",
      "If you want a specific sound, tell us. We have heard most combinations on most platforms and can steer you toward a setup that is loud where you want it and civil on the highway.",
    ],
    highlights: [
      "Cat-back, turbo-back, header and downpipe installs",
      "Intakes with heat shielding that actually work",
      "Sound and drone guidance from experience",
      "Retune included where the change requires it",
    ],
    faqs: [
      {
        question: "Will an exhaust pass NC emissions?",
        answer:
          "Cat-back systems keep factory catalysts and are emissions-friendly. We will advise you before installing anything that affects emissions equipment.",
      },
    ],
    related: ["performance-tuning", "turbo-and-supercharger-installs", "diagnostics"],
    seo: {
      title: "Exhaust & Intake",
      description:
        "Exhaust, header, downpipe and intake installs for Japanese sports cars in Concord, NC near Charlotte. HKS, Tomei, Invidia, Borla and AWE fitted and tuned.",
    },
  },
  {
    slug: "track-prep",
    name: "Track Prep & Safety",
    shortName: "Track Prep",
    icon: "flag",
    featured: false,
    summary:
      "Pre-event inspections, brake and fluid prep, cooling upgrades, seats, harnesses and roll bars for HPDE, time attack and drift.",
    description: [
      "Charlotte Motor Speedway, VIR, Road Atlanta and CMP are all within reach, and we get a lot of cars ready for them. Our track-prep service starts with a tech inspection against the event's requirements, then covers brakes, fluids, cooling, tires and any safety equipment you are adding.",
      "We install seats, harnesses, harness bars and bolt-in roll bars with the correct hardware and geometry, and we set up oil coolers, transmission coolers and radiators for cars that are seeing sustained high load.",
    ],
    highlights: [
      "Tech inspection against event requirements",
      "Cooling, brake and fluid prep for sustained abuse",
      "Seat, harness and roll bar installation",
      "Post-event inspection and reset",
    ],
    faqs: [
      {
        question: "How far in advance should I book track prep?",
        answer:
          "Two weeks before your event is ideal so there is time to order pads or parts if the inspection turns something up.",
      },
    ],
    related: ["brake-upgrades", "suspension-and-alignment", "drivetrain-and-clutch"],
    seo: {
      title: "Track Prep & Safety",
      description:
        "Track day and HPDE prep for Japanese sports cars near Charlotte Motor Speedway. Tech inspections, cooling, brakes, seats and roll bars in Concord, NC.",
    },
  },
] as const satisfies readonly Service[];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const featuredServices = services.filter((service) => service.featured);

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
