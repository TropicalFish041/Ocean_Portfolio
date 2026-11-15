/** Only information displayed after a fish is selected. */
export interface ChapterViewModel {
  readonly title: string;
  readonly items: readonly {
    readonly title: string;
    readonly text: string;
  }[];
}
