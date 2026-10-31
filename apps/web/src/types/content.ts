export interface Taxon {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  categoryId: string;
  category: Taxon;
  tags: { tagId: string; tag: Taxon }[];
  coverImageUrl: string | null;
  coverImageAlt: string;
  publishedAt: string | null;
  createdAt: string;
  viewsCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  likesCount: number;
  ratingsCount: number;
  averageRating: number | null;
  ownLiked: boolean;
  ownRating: number | null;
}
