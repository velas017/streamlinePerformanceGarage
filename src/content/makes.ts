export interface MakeSpecialty {
  readonly make: string;
  readonly models: readonly string[];
  readonly blurb: string;
}

export const makes = [
  {
    make: "Subaru",
    models: ["WRX / STI", "BRZ", "Legacy GT", "Forester XT"],
    blurb:
      "EJ and FA engine builds, ringland-failure rebuilds, flex-fuel calibrations and the routine service that keeps boxers alive.",
  },
  {
    make: "Nissan",
    models: ["GT-R (R32–R35)", "350Z / 370Z / Z", "Skyline", "Silvia / 240SX"],
    blurb:
      "VR38 builds, GR6 service, VQ and SR20 work and the right-hand-drive Skyline experience that comes from years of imports.",
  },
  {
    make: "Honda / Acura",
    models: ["Civic Type R", "S2000", "NSX", "Integra / RSX", "Prelude"],
    blurb:
      "K-series and F20C specialists. Superchargers, valve adjustments, Hondata and K-swap support.",
  },
  {
    make: "Toyota",
    models: ["Supra (A80 / A90)", "GR86 / 86", "MR2", "Celica", "Chaser / Mark II"],
    blurb:
      "2JZ and B58 tuning, single-turbo conversions and honest maintenance for the new and old Supra alike.",
  },
  {
    make: "Mazda",
    models: ["RX-7 (FC / FD)", "RX-8", "MX-5 Miata (NA–ND)", "Mazdaspeed 3 / 6"],
    blurb:
      "13B rotary rebuilds and porting, Miata turbo and supercharger kits, and suspension setups for the best-handling cars on the road.",
  },
  {
    make: "Mitsubishi",
    models: ["Lancer Evolution (VIII–X)", "Eclipse GSX", "3000GT VR-4"],
    blurb:
      "4G63 and 4B11 builds, AWD drivetrain service and the diagnostic patience these cars deserve.",
  },
  {
    make: "Lexus",
    models: ["IS F", "RC F", "GS F", "LC 500", "IS 300"],
    blurb:
      "V8 F-car maintenance, exhaust and suspension, plus 2JZ IS 300 swaps and tuning.",
  },
] as const satisfies readonly MakeSpecialty[];
