export interface Governorate {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu?: string;
  cities: City[];
}

export interface City {
  id: string;
  nameEn: string;
  nameAr: string;
  districts?: string[];
  neighborhoods?: string[];
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu?: string;
  icon?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface Business {
  id: string;
  business_name: string;
  slug: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  governorate: string; // ID of governorate
  city: string; // ID of city
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | 'verified' | 'flagged';
  
  // Contacts Embedded/Linked
  phone_number?: string;
  normalized_phone?: string;
  whatsapp_number?: string;
  normalized_whatsapp?: string;
  email?: string;
  website?: string;

  // Socials Embedded/Linked
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  telegram_url?: string;

  // Metadata
  is_duplicate?: boolean;
  duplicate_of?: string;
  scrape_source?: string;
  confidence_score?: number;
}

export interface ScrapeSource {
  id: string;
  name: string;
  platform: 'google_maps' | 'facebook' | 'instagram' | 'yellowpages' | 'custom_upload';
  url: string;
  last_scrape?: string;
  status: 'active' | 'inactive';
}

export interface DuplicateLog {
  id: string;
  business_id_1: string;
  business_id_2: string;
  business_name_1: string;
  business_name_2: string;
  confidence_score: number; // 0-100
  matching_markers: string[]; // e.g., ["phone", "name_fuzzy"]
  status: 'pending' | 'merged' | 'rejected';
  created_at: string;
}

export interface VerificationLog {
  id: string;
  business_id: string;
  action: 'verified' | 'flagged' | 'edited';
  notes: string;
  performed_by: string;
  created_at: string;
}

export interface PlatformStats {
  totalBusinesses: number;
  businessesByGovernorate: { [key: string]: number };
  businessesByCategory: { [key: string]: number };
  duplicateCount: number;
  verifiedCount: number;
  pendingValidationCount: number;
  sourceBreakdown: { [key: string]: number };
}
