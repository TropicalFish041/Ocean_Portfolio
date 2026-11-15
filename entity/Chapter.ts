/** Framework-independent portfolio content. */
export interface PortfolioItem {
  readonly title: string;
  readonly text: string;
}

export interface Chapter {
  readonly id: string;
  readonly image: string;
  readonly fishName: string;
  readonly title: string;
  readonly items: readonly PortfolioItem[];
}
