export interface ChapterViewModel {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly intro: string;
  readonly fishName: string;
  readonly items: readonly {
    readonly title: string;
    readonly text: string;
  }[];
}
