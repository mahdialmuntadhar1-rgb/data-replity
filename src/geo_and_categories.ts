import { Governorate, Category } from './types';

export const GOVERNORATES: Governorate[] = [
  {
    id: 'baghdad',
    nameEn: 'Baghdad',
    nameAr: 'بغداد',
    cities: [
      { id: 'karkh', nameEn: 'Karkh', nameAr: 'الكرخ', districts: ['Mansour', 'Yarmouk', 'Qadisiya', 'Harthiya', 'Kadhimiya', 'Salihiya'] },
      { id: 'rusafa', nameEn: 'Rusafa', nameAr: 'الرصافة', districts: ['Karada', 'Jadriya', 'Zayouna', 'Waziriyah', 'Bab Al-Sharqi', 'Adhamiyah'] },
      { id: 'sadr_city', nameEn: 'Sadr City', nameAr: 'مدينة الصدر', districts: ['Habibiya', 'Jamila', 'Al-Ubaidi'] },
      { id: 'mahmoudiyah', nameEn: 'Mahmoudiyah', nameAr: 'المحمودية' },
      { id: 'abu_ghraib', nameEn: 'Abu Ghraib', nameAr: 'أبو غريب' },
      { id: 'taji', nameEn: 'Taji', nameAr: 'التاجي' }
    ]
  },
  {
    id: 'basra',
    nameEn: 'Basra',
    nameAr: 'البصرة',
    cities: [
      { id: 'basra_center', nameEn: 'Basra Center', nameAr: 'مركز البصرة', districts: ['Al-Ashar', 'Al-Abassiya', 'Al-Jazaer', 'Al-Bradiyah'] },
      { id: 'zubair', nameEn: 'Al-Zubair', nameAr: 'الزبير' },
      { id: 'qurna', nameEn: 'Al-Qurna', nameAr: 'القرنة' },
      { id: 'faw', nameEn: 'Al-Faw', nameAr: 'الفاو' },
      { id: 'abu_alkhaseeb', nameEn: 'Abu Al-Khaseeb', nameAr: 'أبو الخصيب' }
    ]
  },
  {
    id: 'erbil',
    nameEn: 'Erbil',
    nameAr: 'أربيل',
    nameKu: 'هەولێر',
    cities: [
      { id: 'erbil_center', nameEn: 'Erbil Center', nameAr: 'مركز أربيل', districts: ['Ainkawa', 'Bakhtiyari', 'Empire World', 'Minare', '100m Road', 'Shoresh'] },
      { id: 'shaqlawa', nameEn: 'Shaqlawa', nameAr: 'شقلاوة' },
      { id: 'soran', nameEn: 'Soran', nameAr: 'سوران' },
      { id: 'koya', nameEn: 'Koya', nameAr: 'كويا' },
      { id: 'choman', nameEn: 'Choman', nameAr: 'چۆمان' }
    ]
  },
  {
    id: 'sulaymaniyah',
    nameEn: 'Sulaymaniyah',
    nameAr: 'السليمانية',
    nameKu: 'سلێمانی',
    cities: [
      { id: 'suli_center', nameEn: 'Sulaymaniyah Center', nameAr: 'مركز السليمانية', districts: ['Saholaka', 'Sarchinar', 'Bakhtiyari', 'Rzgari', 'Tuwi Malik'] },
      { id: 'halabja', nameEn: 'Halabja', nameAr: 'حلبجة' },
      { id: 'ranya', nameEn: 'Ranya', nameAr: 'رانيا' },
      { id: 'chamchamal', nameEn: 'Chamchamal', nameAr: 'جمجمال' },
      { id: 'darbandikhan', nameEn: 'Darbandikhan', nameAr: 'دربندخان' }
    ]
  },
  {
    id: 'duhok',
    nameEn: 'Duhok',
    nameAr: 'دهوك',
    nameKu: 'دهۆك',
    cities: [
      { id: 'duhok_center', nameEn: 'Duhok Center', nameAr: 'مركز دهوك', districts: ['Kro', 'Shaxke', 'Masike', 'Geli'] },
      { id: 'zakho', nameEn: 'Zakho', nameAr: 'زاخو' },
      { id: 'amadiya', nameEn: 'Amadiya', nameAr: 'العمادية' },
      { id: 'semel', nameEn: 'Semel', nameAr: 'سيميل' }
    ]
  },
  {
    id: 'najaf',
    nameEn: 'Najaf',
    nameAr: 'النجف',
    cities: [
      { id: 'najaf_center', nameEn: 'Najaf City', nameAr: 'مدينة النجف', districts: ['Al-Adala', 'Al-Ghadir', 'Al-Karama', 'Al-Askari', 'Muthana Street'] },
      { id: 'kufa', nameEn: 'Kufa', nameAr: 'الكوفة' },
      { id: 'manathera', nameEn: 'Al-Manathera', nameAr: 'المناذرة' }
    ]
  },
  {
    id: 'karbala',
    nameEn: 'Karbala',
    nameAr: 'كربلاء',
    cities: [
      { id: 'karbala_center', nameEn: 'Karbala Center', nameAr: 'مركز كربلاء', districts: ['Al-Mulhaq', 'Al-Hurr', 'Al-Hussein', 'Al-Abbas', 'Ramadan Street'] },
      { id: 'hindiyah', nameEn: 'Al-Hindiyah', nameAr: 'الهندية' },
      { id: 'ain_altamur', nameEn: 'Ain Al-Tamur', nameAr: 'عين التمر' }
    ]
  },
  {
    id: 'mosul',
    nameEn: 'Mosul / Nineveh',
    nameAr: 'الموصل / نينوى',
    cities: [
      { id: 'mosul_center', nameEn: 'Mosul City', nameAr: 'مدينة الموصل', districts: ['Left Coast (الجانب الأيسر)', 'Right Coast (الجانب الأيمن)', 'Zuhour', 'Muthanna', 'Al-Majmooah'] },
      { id: 'sinjar', nameEn: 'Sinjar', nameAr: 'سنجار' },
      { id: 'tal_afar', nameEn: 'Tal Afar', nameAr: 'تلعفر' },
      { id: 'sheikhan', nameEn: 'Sheikhan', nameAr: 'شيخان' },
      { id: 'hamdaniya', nameEn: 'Al-Hamdaniya', nameAr: 'الحمدانية' }
    ]
  },
  {
    id: 'kirkuk',
    nameEn: 'Kirkuk',
    nameAr: 'كركوك',
    cities: [
      { id: 'kirkuk_center', nameEn: 'Kirkuk Center', nameAr: 'مركز كركوك', districts: ['Tariq Baghdad', 'Al-Khadra', 'Al-Wasiti', 'Panja Ali', 'Shorja'] },
      { id: 'hawija', nameEn: 'Al-Hawija', nameAr: 'الحويجة' },
      { id: 'daquq', nameEn: 'Daquq', nameAr: 'دقوق' }
    ]
  },
  {
    id: 'babylon',
    nameEn: 'Babylon',
    nameAr: 'بابل',
    cities: [
      { id: 'hilla', nameEn: 'Hilla', nameAr: 'الحلة', districts: ['Al-Jamiaa', 'Al-Iskan', 'Al-Thawra', 'Al-Tayara'] },
      { id: 'mahayil', nameEn: 'Al-Mahawil', nameAr: 'المحاويل' },
      { id: 'hashimiyah', nameEn: 'Al-Hashimiyah', nameAr: 'الهاشمية' },
      { id: 'musayib', nameEn: 'Al-Musayib', nameAr: 'المسيب' }
    ]
  },
  {
    id: 'diyala',
    nameEn: 'Diyala',
    nameAr: 'ديالى',
    cities: [
      { id: 'baqubah', nameEn: 'Baqubah', nameAr: 'بعقوبة', districts: ['Al-Mustafa', 'Baqubah Al-Jadedah', 'Al-Tahrir', 'Al-Mualimin'] },
      { id: 'khanaqin', nameEn: 'Khanaqin', nameAr: 'خانقين' },
      { id: 'muqdadiyah', nameEn: 'Al-Muqdadiyah', nameAr: 'المقدادية' },
      { id: 'khalis', nameEn: 'Al-Khalis', nameAr: 'الخالص' }
    ]
  },
  {
    id: 'wasit',
    nameEn: 'Wasit',
    nameAr: 'واسط',
    cities: [
      { id: 'kut', nameEn: 'Kut', nameAr: 'الكوت', districts: ['Al-Hura', 'Al-Sharqia', 'Anwar Al-Sadr', 'Al-Kafaat'] },
      { id: 'numaniyah', nameEn: 'Al-Numaniyah', nameAr: 'النعمانية' },
      { id: 'suwayrah', nameEn: 'Al-Suwayrah', nameAr: 'الصويرة' },
      { id: 'hay', nameEn: 'Al-Hay', nameAr: 'الحي' }
    ]
  },
  {
    id: 'maysan',
    nameEn: 'Maysan',
    nameAr: 'ميسان',
    cities: [
      { id: 'amarah', nameEn: 'Al-Amarah', nameAr: 'العمارة', districts: ['Kafaat', 'Al-Hussein', 'Al-Shuhada', 'Al-Mualimin'] },
      { id: 'kahla', nameEn: 'Al-Kahla', nameAr: 'الكحلاء' },
      { id: 'maimouna', nameEn: 'Al-Maimouna', nameAr: 'الميمونة' }
    ]
  },
  {
    id: 'dhi_qar',
    nameEn: 'Dhi Qar',
    nameAr: 'ذي قار',
    cities: [
      { id: 'nasiriyah', nameEn: 'Nasiriyah', nameAr: 'الناصرية', districts: ['Al-Thawra', 'Al-Uruba', 'Al-Askari', 'Sumer'] },
      { id: 'shatra', nameEn: 'Al-Shatra', nameAr: 'الشطرة' },
      { id: 'rifai', nameEn: 'Al-Rifai', nameAr: 'الرفاعي' },
      { id: 'suq_al_shuyukh', nameEn: 'Suq Al-Shuyukh', nameAr: 'سوق الشيوخ' }
    ]
  },
  {
    id: 'anbar',
    nameEn: 'Anbar',
    nameAr: 'الأنبار',
    cities: [
      { id: 'ramadi', nameEn: 'Ramadi', nameAr: 'الرمادي', districts: ['Al-Mualimin', 'Al-Andalus', 'Al-Tamim', 'Al-Adala', 'Al-Dhabat'] },
      { id: 'fallujah', nameEn: 'Fallujah', nameAr: 'الفلوجة', districts: ['Nazzal', 'Al-Shuhada', 'Al-Julan', 'Al-Shorta'] },
      { id: 'hit', nameEn: 'Hit', nameAr: 'هيت' },
      { id: 'haditha', nameEn: 'Haditha', nameAr: 'حديثة' },
      { id: 'qaim', nameEn: 'Al-Qaim', nameAr: 'القائم' }
    ]
  },
  {
    id: 'salahaddin',
    nameEn: 'Salahaddin',
    nameAr: 'صلاح الدين',
    cities: [
      { id: 'tikrit', nameEn: 'Tikrit', nameAr: 'تكريت', districts: ['Al-Zuhour', 'Al-Qadsia', 'Al-Dhabat', 'Al-Deom'] },
      { id: 'samarra', nameEn: 'Samarra', nameAr: 'سامراء', districts: ['Al-Khadra', 'Al-Mualimin', 'Al-Qatool'] },
      { id: 'balad', nameEn: 'Balad', nameAr: 'بلد' },
      { id: 'shirqat', nameEn: 'Al-Shirqat', nameAr: 'الشرقاط' },
      { id: 'tuz_khurmatu', nameEn: 'Tuz Khurmatu', nameAr: 'طوزخورماتو' }
    ]
  },
  {
    id: 'muthanna',
    nameEn: 'Muthanna',
    nameAr: 'المثنى',
    cities: [
      { id: 'samawah', nameEn: 'Samawah', nameAr: 'السماوة', districts: ['Al-Gharbi', 'Al-Iskan', 'Al-Mualimin', 'Al-Askari'] },
      { id: 'rumeitha', nameEn: 'Al-Rumeitha', nameAr: 'الرميثة' },
      { id: 'khidhr', nameEn: 'Al-Khidhr', nameAr: 'الخضر' }
    ]
  },
  {
    id: 'qadisiyyah',
    nameEn: 'Qadisiyyah',
    nameAr: 'القادسية',
    cities: [
      { id: 'diwaniah', nameEn: 'Diwaniya', nameAr: 'الديوانية', districts: ['Al-Uruba', 'Al-Adala', 'Al-Iskan', 'Al-Nefrat'] },
      { id: 'shamiya', nameEn: 'Al-Shamiya', nameAr: 'الشامية' },
      { id: 'hamza', nameEn: 'Al-Hamza', nameAr: 'الجمزة' }
    ]
  }
];

export const CATEGORIES: Category[] = [
  {
    id: 'restaurants',
    nameEn: 'Restaurants',
    nameAr: 'مطاعم',
    icon: 'Utensils',
    subcategories: [
      { id: 'iraqi_food', nameEn: 'Traditional Iraqi', nameAr: 'شعبية وعراقية' },
      { id: 'fast_food', nameEn: 'Fast Food', nameAr: 'وجبات سريعة' },
      { id: 'shawarma_grill', nameEn: 'Grills & Shawarma', nameAr: 'مشويات وشاورما' },
      { id: 'seafood', nameEn: 'Seafood', nameAr: 'مأكولات بحرية' },
      { id: 'international', nameEn: 'International', nameAr: 'عالمي' }
    ]
  },
  {
    id: 'cafes',
    nameEn: 'Cafes',
    nameAr: 'مقاهي وكافيهات',
    icon: 'Coffee',
    subcategories: [
      { id: 'specialty_coffee', nameEn: 'Specialty Coffee', nameAr: 'قهوة مختصة' },
      { id: 'traditional_cafe', nameEn: 'Traditional Chai-Khana', nameAr: 'شاي خانة تراثي' },
      { id: 'family_cafe', nameEn: 'Family Cafe', nameAr: 'كافيه عائلي' }
    ]
  },
  {
    id: 'hotels',
    nameEn: 'Hotels',
    nameAr: 'فنادق',
    icon: 'Hotel',
    subcategories: [
      { id: 'luxury_hotel', nameEn: 'Luxury (5-Star)', nameAr: 'فنادق فاخرة' },
      { id: 'mid_range', nameEn: 'Standard / Budget', nameAr: 'اقتصادي واعتيادي' },
      { id: 'hotel_apartments', nameEn: 'Hotel Apartments', nameAr: 'شقق فندقية' }
    ]
  },
  {
    id: 'hospitals',
    nameEn: 'Hospitals',
    nameAr: 'مستشفيات',
    icon: 'Hospital',
    subcategories: [
      { id: 'general_hospital', nameEn: 'General Hospital', nameAr: 'مستشفى عام' },
      { id: 'private_hospital', nameEn: 'Private Hospital', nameAr: 'مستشفى أهلي خاص' },
      { id: 'specialty_center', nameEn: 'Specialty Surgical Center', nameAr: 'مركز جراحي متخصّص' }
    ]
  },
  {
    id: 'clinics',
    nameEn: 'Clinics',
    nameAr: 'عيادات طبية',
    icon: 'Stethoscope',
    subcategories: [
      { id: 'dental', nameEn: 'Dental Clinics', nameAr: 'عيادات طب الأسنان' },
      { id: 'pediatric', nameEn: 'Pediatrics', nameAr: 'عيادات الأطفال' },
      { id: 'dermatology', nameEn: 'Dermatology & Laser', nameAr: 'جلدية وليزر' },
      { id: 'cardiology', nameEn: 'Cardiology', nameAr: 'عيادات أمراض القلب' }
    ]
  },
  {
    id: 'pharmacies',
    nameEn: 'Pharmacies',
    nameAr: 'صيدليات',
    icon: 'Pill',
    subcategories: [
      { id: '24h_pharmacy', nameEn: '24 Hour Pharmacy', nameAr: 'صيدلية ٢٤ ساعة' },
      { id: 'cosmetics_pharma', nameEn: 'Clinical & Cosmetics', nameAr: 'صيدلية تجميلية ودوائية' }
    ]
  },
  {
    id: 'markets',
    nameEn: 'Markets',
    nameAr: 'أسواق وسوبرماركت',
    icon: 'Store',
    subcategories: [
      { id: 'hypermarket', nameEn: 'Hypermarket / Mall-Store', nameAr: 'هايبرماركت' },
      { id: 'supermarket', nameEn: 'Supermarket', nameAr: 'سوبرماركت عائلي' },
      { id: 'local_grocer', nameEn: 'Local Minimarket', nameAr: 'بقالة وأسواق محلية' }
    ]
  },
  {
    id: 'shopping',
    nameEn: 'Shopping Malls',
    nameAr: 'مراكز تسوق ومولات',
    icon: 'ShoppingBag',
    subcategories: [
      { id: 'commercial_malls', nameEn: 'Mega Shopping Malls', nameAr: 'مولات تجارية كبرى' },
      { id: 'bazaars', nameEn: 'Traditional Bazaars', nameAr: 'أسواق شعبية تاريخية' }
    ]
  },
  {
    id: 'electronics',
    nameEn: 'Electronics',
    nameAr: 'إلكترونيات وهواتف',
    icon: 'Smartphone',
    subcategories: [
      { id: 'mobile_shops', nameEn: 'Mobile & Accessories', nameAr: 'مبيعات وصيانة الهواتف' },
      { id: 'home_appliances', nameEn: 'Home Appliances', nameAr: 'أجهزة منزلية' },
      { id: 'computers_it', nameEn: 'Computers & IT Networks', nameAr: 'حاسبات وشبكات' }
    ]
  },
  {
    id: 'automotive',
    nameEn: 'Automotive',
    nameAr: 'سيارات ومركبات',
    icon: 'Car',
    subcategories: [
      { id: 'car_showroom', nameEn: 'Car Showrooms / Dealers', nameAr: 'معارض سيارات' },
      { id: 'spare_parts', nameEn: 'Spare Parts & Tires', nameAr: 'أدوات احتياطية وإطارات' },
      { id: 'maintenance_auto', nameEn: 'Auto Service & Repairs', nameAr: 'صيانة وتصليح سيارات' }
    ]
  },
  {
    id: 'construction',
    nameEn: 'Construction',
    nameAr: 'مقاولات ومواد بناء',
    icon: 'HardHat',
    subcategories: [
      { id: 'construction_materials', nameEn: 'Building Materials', nameAr: 'مواد بناء وإنشائية' },
      { id: 'engineering_consult', nameEn: 'Contracting & Architectural', nameAr: 'شركات مقاولات واستشارات هندسية' }
    ]
  },
  {
    id: 'real_estate',
    nameEn: 'Real Estate',
    nameAr: 'عقارات',
    icon: 'Building',
    subcategories: [
      { id: 're_agency', nameEn: 'Real Estate Agency', nameAr: 'مكاتب دلالة وعقارات' },
      { id: 'developer', nameEn: 'Property Developers', nameAr: 'تطوير عقاري واستثمار سكني' }
    ]
  },
  {
    id: 'education',
    nameEn: 'Education',
    nameAr: 'تعليم وتدريب',
    icon: 'GraduationCap',
    subcategories: [
      { id: 'private_schools', nameEn: 'Private Schools', nameAr: 'مدارس أهلية' },
      { id: 'universities', nameEn: 'Universities / Colleges', nameAr: 'جامعات وكليات أهلية' },
      { id: 'language_institutes', nameEn: 'Training Centers & Languages', nameAr: 'مراكز تدريب ولغات' }
    ]
  },
  {
    id: 'gyms',
    nameEn: 'Gyms & Sports',
    nameAr: 'قاعات رياضية ورشاقة',
    icon: 'Dumbbell',
    subcategories: [
      { id: 'fitness_gym', nameEn: 'Fitness & Bodybuilding', nameAr: 'جيم وحديد' },
      { id: 'swimming_pools', nameEn: 'Swimming & Sports Clubs', nameAr: 'مسابح ونوادي ترفيهية' }
    ]
  },
  {
    id: 'beauty_salons',
    nameEn: 'Beauty Salons & Spa',
    nameAr: 'صالونات ومراكز تجميل',
    icon: 'Sparkles',
    subcategories: [
      { id: 'womens_beauty', nameEn: 'Women\'s Beauty Centers', nameAr: 'صالونات نسائية ومراكز تجميل' },
      { id: 'barber_mens', nameEn: 'Men\'s Grooming / Barbers', nameAr: 'حلاقة وصالونات رجالية' }
    ]
  },
  {
    id: 'fashion',
    nameEn: 'Fashion & Clothing',
    nameAr: 'أزياء وملابس',
    icon: 'Shirt',
    subcategories: [
      { id: 'mens_wear', nameEn: 'Men\'s Fashion', nameAr: 'ملابس رجالية' },
      { id: 'womens_wear', nameEn: 'Women\'s Clothing', nameAr: 'أزياء نسائية' },
      { id: 'kids_wear', nameEn: 'Kids & Babies Wear', nameAr: 'ألبسة أطفال' }
    ]
  },
  {
    id: 'furniture',
    nameEn: 'Furniture',
    nameAr: 'أثاث ومفروشات',
    icon: 'Armchair',
    subcategories: [
      { id: 'home_furniture', nameEn: 'Home & Living Furniture', nameAr: 'أثاث منزلي ومطابخ' },
      { id: 'office_furniture', nameEn: 'Office Furniture', nameAr: 'أثاث مكتبي' }
    ]
  },
  {
    id: 'delivery_services',
    nameEn: 'Delivery & Logistics',
    nameAr: 'خدمات توصيل ولوجستيات',
    icon: 'Truck',
    subcategories: [
      { id: 'food_delivery', nameEn: 'Food & Groceries Apps', nameAr: 'توصيل طعام ودليفري' },
      { id: 'cargo_express', nameEn: 'Cargo & Express Shipping', nameAr: 'شحن بري وخدمات طرود' }
    ]
  },
  {
    id: 'tourism',
    nameEn: 'Tourism & Travel',
    nameAr: 'سياحة وسفر',
    icon: 'Compass',
    subcategories: [
      { id: 'travel_agency', nameEn: 'Travel & Ticketing Agency', nameAr: 'مكاتب حجز طيران وسياحة' },
      { id: 'tour_operator', nameEn: 'Religious & Medical Tourism', nameAr: 'سياحة دينية وعلاجية' }
    ]
  },
  {
    id: 'financial_services',
    nameEn: 'Financial Services',
    nameAr: 'خدمات مالية وصيرفة',
    icon: 'Coins',
    subcategories: [
      { id: 'exchange_companies', nameEn: 'Money Exchange & Remittance', nameAr: 'شركات صيرفة وحوالات' },
      { id: 'private_banks', nameEn: 'Private Banks & ATMs', nameAr: 'مصارف أهلية صرافات' }
    ]
  }
];

export function getGovernorateName(id: string, lang: 'en' | 'ar' | 'ku' = 'en'): string {
  const gov = GOVERNORATES.find(g => g.id === id);
  if (!gov) return id;
  if (lang === 'ar') return gov.nameAr;
  if (lang === 'ku') return gov.nameKu || gov.nameAr;
  return gov.nameEn;
}

export function getCityName(govId: string, cityId: string, lang: 'en' | 'ar' | 'ku' = 'en'): string {
  const gov = GOVERNORATES.find(g => g.id === govId);
  if (!gov) return cityId;
  const city = gov.cities.find(c => c.id === cityId);
  if (!city) return cityId;
  if (lang === 'ar') return city.nameAr;
  return city.nameEn;
}

export function getCategoryName(id: string, lang: 'en' | 'ar' | 'ku' = 'en'): string {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return id;
  if (lang === 'ar') return cat.nameAr;
  if (lang === 'ku' && cat.nameKu) return cat.nameKu;
  return cat.nameEn;
}

export function getSubcategoryName(catId: string, subId: string, lang: 'en' | 'ar' | 'ku' = 'en'): string {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat || !cat.subcategories) return subId;
  const sub = cat.subcategories.find(s => s.id === subId);
  if (!sub) return subId;
  if (lang === 'ar') return sub.nameAr;
  return sub.nameEn;
}
