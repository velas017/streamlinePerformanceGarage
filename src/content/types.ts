export interface Faq {
  readonly question: string;
  readonly answer: string;
}

export interface SeoFields {
  /** ≤ 60 chars before the site template is applied. */
  readonly title: string;
  /** 120–160 chars, includes a city and a service/make where natural. */
  readonly description: string;
  readonly keywords?: readonly string[];
}
