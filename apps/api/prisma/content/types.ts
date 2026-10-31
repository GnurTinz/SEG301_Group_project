export interface SeedArticle {
  title: string;
  summary: string;
  paragraphs: string[];
  category: string;
  tags: string[];
}
export const article = (
  category: string,
  title: string,
  summary: string,
  tags: string[],
  ...paragraphs: string[]
): SeedArticle => ({ category, title, summary, tags, paragraphs });
