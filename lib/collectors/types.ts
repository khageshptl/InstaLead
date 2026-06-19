export interface CollectedContact {
  type: "EMAIL" | "PHONE" | "ADDRESS" | "SOCIAL" | "OTHER";
  value: string;
  label?: string;
  source: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CollectorResult<T> {
  success: boolean;
  data: T | null;
  contacts: CollectedContact[];
  errors: string[];
}

export interface PublicProfileData {
  platform: string;
  username?: string;
  displayName?: string;
  bio?: string;
  websiteUrl?: string;
  businessCategory?: string;
  location?: string;
  hasContactButton: boolean;
  profileImageUrl?: string;
  followerCount?: number;
  isPublic: boolean;
  rawData?: Record<string, unknown>;
}

export interface WebsiteData {
  url: string;
  title?: string;
  description?: string;
  contactPageUrl?: string;
  aboutPageUrl?: string;
  teamPageUrl?: string;
  footerText?: string;
  schemaData?: Record<string, unknown>;
  rawData?: Record<string, unknown>;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
  displayName?: string;
}

export interface CompanyIntelligence {
  name?: string;
  description?: string;
  addresses: string[];
  emails: string[];
  supportChannels: string[];
  industry?: string;
}
