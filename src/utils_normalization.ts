/**
 * Normalizes Iraqi phone numbers to the format: +964XXXXXXXXXX
 * Handles various inputs like:
 * - 0770 123 4567
 * - +964 770 123 4567
 * - 9647701234567
 * - 0780-123-4567
 */
export function normalizeIraqiPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove spaces, dashes, parentheses and all non-numeric characters except +
  let cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
  
  // If numeric only:
  // Check double zero prefix
  if (cleaned.startsWith('00964')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('964')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('07') || cleaned.startsWith('7')) {
    if (cleaned.startsWith('07')) {
      cleaned = cleaned.substring(1); // remove leading 0
    }
  }

  // Iraqi mobile numbers have 9 digits after the country code or operator prefix (e.g., 770123456)
  // Standard length is 10 digits starting with 7
  if (cleaned.match(/^7[3-9]\d{8}$/)) {
    return `+964${cleaned}`;
  }
  
  // Fallback for shortcodes or landlines
  return phone.trim().replace(/\s+/g, '');
}

/**
 * Checks if a string contains a WhatsApp link or mention, and extracts the phone
 */
export function detectWhatsApp(contactStr: string | null | undefined): { isWhatsApp: boolean; phone: string } {
  if (!contactStr) return { isWhatsApp: false, phone: '' };

  const lower = contactStr.toLowerCase();
  let phone = '';
  let isWhatsApp = false;

  if (lower.includes('wa.me/') || lower.includes('api.whatsapp.com') || lower.includes('chat.whatsapp.com')) {
    isWhatsApp = true;
    // Extract numbers after wa.me/ or similar
    const matches = contactStr.match(/(?:wa\.me|whatsapp\.com\/send\?phone=)(\+?\d+)/i);
    if (matches && matches[1]) {
      phone = normalizeIraqiPhone(matches[1]);
    }
  }

  // Also if it looks like a normalized mobile number and is marked, we can assume WhatsApp
  return { isWhatsApp, phone };
}

/**
 * Clean & normalize Arabic text for uniform matching and searching
 */
export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';
  let normalized = text.toLowerCase().trim();

  // Normalize Unicode Alef variations to simple Alef
  normalized = normalized.replace(/[أإآا]/g, 'ا');
  // Normalize Teh Marbuta to Heh
  normalized = normalized.replace(/ة/g, 'ه');
  // Normalize Yeh variations
  normalized = normalized.replace(/[ىيِ]/g, 'ي');
  // Remove Arabic diacritics (Fatha, Damma, Kasra, Shadda, etc.)
  normalized = normalized.replace(/[\u064B-\u0652]/g, '');
  // Remove extra whitespaces
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Strips common prefix noise and business tokens in both English and Arabic to allow fuzzy matching
 */
export function stripBusinessNoise(name: string): string {
  let cleaned = name.toLowerCase();
  
  // English common words
  const enNoise = ['restaurant', 'cafe', 'co', 'company', 'shop', 'store', 'market', 'hotel', 'hospital', 're', 'rest', 'and', 'the', 'al-'];
  enNoise.forEach(noise => {
    const reg = new RegExp(`\\b${noise}\\b`, 'gi');
    cleaned = cleaned.replace(reg, '');
  });

  // Arabic common words
  const arNoise = ['مطعم', 'كافيه', 'سوبرماركت', 'سوبر ماركت', 'محل', 'شركة', 'مستشفى', 'فندق', 'ال'];
  arNoise.forEach(noise => {
    cleaned = cleaned.replace(new RegExp(noise, 'g'), '');
  });

  return cleaned.replace(/[\s\-\_\,\.\/]+/g, ' ').trim();
}

/**
 * Computes Levenshtein Distance similarity score (0 to 100)
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j - 1][i] + 1, // deletion
        track[j][i - 1] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Calculates GPS distance between two coordinates in meters
 */
export function calculateDistanceInMeters(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
}

/**
 * Clears social links and cleans queries
 */
export function cleanSocialUrl(url: string | null | undefined): string {
  if (!url) return '';
  let cleaned = url.trim().toLowerCase();
  
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  
  try {
    const parsed = new URL(cleaned);
    // Remove query params like ?fbclid=...
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
  } catch(e) {
    return cleaned;
  }
}

/**
 * Advanced Duplicate Checker Pipelines that returns details and confidence scores (0-100)
 */
export function evaluateDuplicateConfidence(
  b1: { business_name: string; normalized_phone?: string; whatsapp_number?: string; facebook_url?: string; instagram_url?: string; latitude?: number; longitude?: number; address?: string },
  b2: { business_name: string; normalized_phone?: string; whatsapp_number?: string; facebook_url?: string; instagram_url?: string; latitude?: number; longitude?: number; address?: string }
): { score: number; markers: string[] } {
  let score = 0;
  const markers: string[] = [];

  // 1. Direct phone match
  if (b1.normalized_phone && b2.normalized_phone && b1.normalized_phone === b2.normalized_phone) {
    score += 50;
    markers.push('phone');
  }

  // 2. Direct WhatsApp match
  if (b1.whatsapp_number && b2.whatsapp_number && b1.whatsapp_number === b2.whatsapp_number) {
    score += 40;
    markers.push('whatsapp');
  }

  // 3. Direct social matches
  if (b1.facebook_url && b2.facebook_url && cleanSocialUrl(b1.facebook_url) === cleanSocialUrl(b2.facebook_url)) {
    score += 35;
    markers.push('facebook');
  }
  if (b1.instagram_url && b2.instagram_url && cleanSocialUrl(b1.instagram_url) === cleanSocialUrl(b2.instagram_url)) {
    score += 35;
    markers.push('instagram');
  }

  // 4. Name fuzzy matches (Arabic and English normalized string matching)
  const norm1 = normalizeArabic(b1.business_name);
  const norm2 = normalizeArabic(b2.business_name);
  const simOriginal = calculateLevenshteinSimilarity(norm1, norm2);

  const stripped1 = stripBusinessNoise(norm1);
  const stripped2 = stripBusinessNoise(norm2);
  const simStripped = calculateLevenshteinSimilarity(stripped1, stripped2);

  const bestNameSim = Math.max(simOriginal, simStripped);
  
  if (bestNameSim >= 95) {
    score += 45;
    markers.push('name_exact');
  } else if (bestNameSim >= 80) {
    score += 30;
    markers.push('name_fuzzy_high');
  } else if (bestNameSim >= 60) {
    score += 15;
    markers.push('name_fuzzy_mid');
  }

  // 5. GPS proximity bonus
  const distance = calculateDistanceInMeters(b1.latitude, b1.longitude, b2.latitude, b2.longitude);
  if (distance !== null) {
    if (distance < 50) {
      score += 25;
      markers.push('gps_very_close');
    } else if (distance < 200) {
      score += 15;
      markers.push('gps_close');
    } else if (distance > 2000) {
      // Penalty for far distance if name matches fuzzy but locations are entirely different
      score -= 30;
      markers.push('gps_far_penalty');
    }
  }

  // Cap score at 100, and minimum of 0
  const finalScore = Math.max(0, Math.min(100, score));
  return { score: finalScore, markers };
}

/**
 * Standard data-cleaning pipeline for businesses before saving
 */
export function cleanBusinessData(b: any): any {
  const result = { ...b };
  
  if (result.business_name) {
    // Remove emojis, double spaces and trim
    result.business_name = result.business_name
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (result.description) {
    result.description = result.description.replace(/\s+/g, ' ').trim();
  }

  if (result.address) {
    result.address = result.address.replace(/\s+/g, ' ').trim();
  }

  // Normalize phone & WhatsApp
  if (result.phone_number) {
    result.normalized_phone = normalizeIraqiPhone(result.phone_number);
  }
  if (result.whatsapp_number) {
    result.normalized_whatsapp = normalizeIraqiPhone(result.whatsapp_number);
  }

  // Clean social links
  if (result.facebook_url) result.facebook_url = cleanSocialUrl(result.facebook_url);
  if (result.instagram_url) result.instagram_url = cleanSocialUrl(result.instagram_url);
  if (result.tiktok_url) result.tiktok_url = cleanSocialUrl(result.tiktok_url);
  if (result.telegram_url) result.telegram_url = cleanSocialUrl(result.telegram_url);

  return result;
}
