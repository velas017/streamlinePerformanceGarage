export interface MakeSpecialty {
  readonly make: string;
  readonly models: readonly string[];
  readonly blurb: string;
}

/** The four makes the shop focuses on (per the client, 2026-09-07). Section hidden on the home page for now. */
export const makes = [
  {
    make: "Subaru",
    models: ["WRX / STI", "BRZ", "Legacy GT", "Forester XT", "Impreza"],
    blurb:
      "EJ and FA engine builds, ringland-failure rebuilds, flex-fuel calibrations and the routine service that keeps boxers alive.",
  },
  {
    make: "Honda / Acura",
    models: ["Civic Type R", "S2000", "NSX", "Integra / RSX", "Civic Si"],
    blurb:
      "K-series and F20C specialists. Superchargers, valve adjustments, Hondata and K-swap support.",
  },
  {
    make: "Nissan",
    models: ["350Z / 370Z / Z", "240SX", "GT-R", "Infiniti G35 / G37"],
    blurb:
      "VQ and SR20 work, drivetrain and suspension setups, and honest maintenance for older chassis.",
  },
  {
    make: "Toyota",
    models: ["Supra (A80 / A90)", "GR86 / 86", "GR Corolla", "MR2"],
    blurb:
      "2JZ and B58 tuning, GR86 bolt-ons and the maintenance that keeps them reliable.",
  },
] as const satisfies readonly MakeSpecialty[];
