/** Framework-independent model for one portfolio chapter. */
export interface PortfolioItem {
  readonly title: string;
  readonly text: string;
}

export interface Chapter {
  readonly id: string;
  readonly image: string;
  readonly fishName: string;
  readonly imageDescription: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly subtitle: string;
  readonly intro: string;
  readonly items: readonly PortfolioItem[];
}
