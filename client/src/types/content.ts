export interface PostMeta {
  slug: string;
  title: string;
  date: string; // ISO date
  tags: string[];
  excerpt: string;
  ogImage?: string;
}

export interface Post extends PostMeta {
  content: string;
}
