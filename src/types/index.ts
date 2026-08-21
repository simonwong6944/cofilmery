export type UserRole = 'elder' | 'creator' | 'sponsor' | 'admin';
export type CreatorTier = 'trainee' | 'certified' | 'senior' | 'contracted';
export type ProjectMode = 'drama' | 'legacy';
export type ProjectStatus = 'draft' | 'reviewing' | 'published' | 'revision' | 'approved';
export type SupportedLocale = 'zh-HK' | 'en' | 'zh-CN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  tier?: CreatorTier | string;
  credits?: number;
  practiceCredits?: number;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  mode: ProjectMode;
  status: ProjectStatus;
  episodes: number;
  completedEpisodes: number;
  thumbnail: string;
  creator: { id: string; name: string; age: number; tier: CreatorTier };
  views: number;
  esgScore: number;
  description: string;
  tags: string[];
  publishedAt: string;
  duration: number;
}

export interface FiveDimScore {
  content: number;
  language: number;
  culture: number;
  ethics: number;
  commercial: number;
}
