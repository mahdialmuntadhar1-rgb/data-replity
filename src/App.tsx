import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Cpu, 
  Settings, 
  CheckCircle2, 
  Search, 
  Layers, 
  MessageSquare,
  Globe,
  PlusCircle,
  X,
  Plus,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Governorate, Category, Business } from './types';
import DirectoryView from './components/DirectoryView';
import AdminDashboard from './components/AdminDashboard';
import ScraperView from './components/ScraperView';

// Dictionary of multi-lingual translations (EN, AR, KU)
const TRANSLATIONS = {
  en: {
    title: "Iraq Business Platform",
    subtitle: "Public Business Discovery, Phone Normalization & Deduplication System",
    directoryTab: "Public Directory",
    scrapeTab: "Ingestion & Scraper Box",
    adminTab: "Admin Workbench",
    addBusinessButton: "New Listing",
    statsTotal: "Total Directory Size",
    statsVerified: "Verified Audits",
    statsPending: "Peer Reviews Required",
    duplicateCount: "Duplicate Conflicts",
    searchPlaceholder: "Search businesses, phone numbers, or cities...",
    showingResults: "Showing",
    businesses: "Businesses",
    filters: "Index Filter Cascade",
    governorate: "Governorate",
    allGovernorates: "All Iraq Governorates (18)",
    city: "City",
    allCities: "All Districts / Selected Cities",
    category: "Main Category Sector",
    allCategories: "All Category Sectors",
    subcategory: "Subcategory / Service",
    allSubcategories: "All Optional Subcategories",
    clearFilters: "Clear Filters",
    loading: "Synthesizing",
    loadMore: "Verify next records",
    noContact: "Call unavailable",
    whatsapp: "WhatsApp Chat",
    duplicateWorkbench: "Side-by-Side De-duplication review",
    confidenceScore: "Probability Score",
    editListingTitle: "Revise Corporate Record",
    saveChanges: "Save Cleaned Data",
    close: "Close"
  },
  ar: {
    title: "منصة دليل وأعمال العراق",
    subtitle: "نظام استكشاف الشركات العام وتوحيد الهواتف ومنع التكرار الذكي",
    directoryTab: "الدليل العام الموحد",
    scrapeTab: "لوحة السحب والاستخلاص",
    adminTab: "مكتب الإشراف والتدقيق",
    addBusinessButton: "إضافة منشأة جديدة",
    statsTotal: "حجم دليل الأعمال",
    statsVerified: "سجلات مطابقة موثقة",
    statsPending: "مراجعات قيد الانتظار",
    duplicateCount: "تأكيدات تكرار محتملة",
    searchPlaceholder: "ابحث باسم الشركة، الهاتف، خدمات أو مدن...",
    showingResults: "عرض",
    businesses: "منشأة تجارية وطبية",
    filters: "تخصيص الفلاتر المتقاطعة",
    governorate: "المحافظة",
    allGovernorates: "كل المحافظات العراقية (18)",
    city: "المدينة أو القضاء",
    allCities: "كل الأقضية والأحياء المتاحة",
    category: "القطاع التجاري الأساسي",
    allCategories: "كل القطاعات التجارية",
    subcategory: "التصنيف الفرعي / الخدمة",
    allSubcategories: "كل المجالات الفرعية",
    clearFilters: "إعادة ضبط",
    loading: "جاري التحميل",
    loadMore: "تحميل المزيد من السجلات",
    noContact: "الاتصال غير متوفر",
    whatsapp: "دردش عبر واتساب",
    duplicateWorkbench: "مراجعة وتوفيق المتكررات يدوياً",
    confidenceScore: "درجة مطابقة الثقة",
    editListingTitle: "مراجعة وتصحيح تفاصيل المنشأة",
    saveChanges: "حفظ البيانات الطاهرة",
    close: "إغلاق"
  },
  ku: {
    title: "سەکۆی کار و بزنسی عێراق",
    subtitle: "سیستەمی دۆزینەوەی کۆمپانیاکان و قەدەغەکردنی دووبارەبوونەوە",
    directoryTab: "ڕێبەری گشتی یەکگرتوو",
    scrapeTab: "پەنێلی کۆکردنەوە و داتا",
    adminTab: "مێزی سەرپەرشتیار",
    addBusinessButton: "تۆمارکردنی نوێ",
    statsTotal: "قەبارەی گشتی بزنس",
    statsVerified: "تۆماری سەلمێنراو",
    statsPending: "چاوەڕوانی پێداچوونەوە",
    duplicateCount: "ململانێی دووبارە",
    searchPlaceholder: "بگەڕێ بۆ کۆمپانیا، مۆبایل، دیسک تێکست...",
    showingResults: "پیشاندانی",
    businesses: "بزنس و دەزگاکان",
    filters: "دیاریکردنی فلتەرەکان",
    governorate: "پارێزگا",
    allGovernorates: "هەموو پارێزگاکانی عێراق (18)",
    city: "شار یان ناوچە",
    allCities: "هەموو قەزا و گەڕەکەکان",
    category: "کەرتی سەرەکی بزنس",
    allCategories: "هەموو کەرتەکان",
    subcategory: "کەرتی فرعی / خزمەتگوزاری",
    allSubcategories: "هەموو کەرتقۆناغەکان",
    clearFilters: "پاککردنەوەی فلتەر",
    loading: "بارکردنی داتا",
    loadMore: "بینینی زیاتر",
    noContact: "پەیوەندی بەردەست نییە",
    whatsapp: "واتسئەپ",
    duplicateWorkbench: "کۆنتڕۆڵکردنی نوێی دووبارەبووەکان",
    confidenceScore: "نمرەی متمانەی هاوشێوەیی",
    editListingTitle: "دەستکاری زانیارییەکانی بزنس",
    saveChanges: "پاشەکەوتکردنی داتای نوێ",
    close: "داخستن"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'scrape' | 'admin'>('directory');
  const [language, setLanguage] = useState<'en' | 'ar' | 'ku'>('ar'); // Default to Arabic for localized experience
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Governorate[]>([]);
  const [reloaderSeq, setReloaderSeq] = useState(0); // Trigger reload in direct list

  // Manual Creation & Editing Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [isNewListing, setIsNewListing] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Partial<Business> | null>(null);

  useEffect(() => {
    // Load options
    const loadSchemaOptions = async () => {
      try {
        const catRes = await fetch('/api/categories');
        const cats = await catRes.json();
        setCategories(cats);

        const locRes = await fetch('/api/locations');
        const locs = await locRes.json();
        setLocations(locs);
      } catch (e) {
        console.error("Failed loading geographic or category configuration parameters", e);
      }
    };
    loadSchemaOptions();
  }, []);

  const triggerDirectoryReload = () => {
    setReloaderSeq(prev => prev + 1);
  };

  const handleOpenNewListingForm = () => {
    setIsNewListing(true);
    setEditingBusiness({
      business_name: '',
      description: '',
      category_id: categories[0]?.id || 'restaurants',
      subcategory_id: '',
      governorate: locations[0]?.id || 'baghdad',
      city: locations[0]?.cities[0]?.id || 'karkh',
      address: '',
      phone_number: '',
      whatsapp_number: '',
      facebook_url: '',
      instagram_url: '',
      website: '',
      verification_status: 'pending'
    });
    setShowEditModal(true);
  };

  const handleOpenEditForm = (business: Business) => {
    setIsNewListing(false);
    setEditingBusiness(business);
    setShowEditModal(true);
  };

  const handleSaveBusiness = async () => {
    if (!editingBusiness || !editingBusiness.business_name) return;

    try {
      const method = isNewListing ? 'POST' : 'PUT';
      const url = isNewListing ? '/api/businesses' : `/api/businesses/${editingBusiness.id}`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingBusiness)
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingBusiness(null);
        triggerDirectoryReload();
      }
    } catch (err) {
      console.error("Failed saving business item", err);
    }
  };

  const activeTranslations = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Visual Navigation Header Banner */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo Brand Title (Anti-AI-Slop strict literal branding) */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-11 md:w-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md">
                <Building2 className="h-5.5 w-5.5 text-slate-100" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-sans font-bold tracking-tight text-slate-900/90">
                  {activeTranslations.title}
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-sans hidden sm:block">
                  {language === 'ar' ? 'البوابة الذكية لمحترفي جمع البيانات والمشترين' : 'Authorized Iraqi Geographic Directory'}
                </p>
              </div>
            </div>

            {/* Language & Workspace Toggles block */}
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* Multilingual Selector (EN / AR / KU) - STEP 15 */}
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-0.5 border border-slate-200">
                {[
                  { value: 'ar', label: 'عربي' },
                  { value: 'ku', label: 'كردي' },
                  { value: 'en', label: 'EN' }
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => setLanguage(item.value as any)}
                    className={`text-xs font-sans px-2.5 py-1.5 rounded-lg font-medium transition duration-150 ${language === item.value ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Add New Listing Trigger Button */}
              <button
                onClick={handleOpenNewListingForm}
                className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition duration-150"
              >
                <Plus className="h-4 w-4" />
                {activeTranslations.addBusinessButton}
              </button>
            </div>

          </div>

          {/* Tab Sub-Header Switcher */}
          <div className="flex border-t border-slate-50 gap-6 text-sm font-sans">
            {[
              { id: 'directory', label: activeTranslations.directoryTab },
              { id: 'scrape', label: activeTranslations.scrapeTab },
              { id: 'admin', label: activeTranslations.adminTab }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-2 border-b-2 font-medium transition duration-150 relative ${isActive ? 'border-semibold border-slate-800 text-slate-900 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" 
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + language + reloaderSeq}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'directory' && (
              <DirectoryView 
                categories={categories}
                locations={locations}
                language={language}
                translations={activeTranslations}
                onEditBusiness={handleOpenEditForm}
              />
            )}

            {activeTab === 'scrape' && (
              <ScraperView 
                categories={categories}
                locations={locations}
                language={language}
                translations={activeTranslations}
                onRefreshDirectory={triggerDirectoryReload}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard 
                categories={categories}
                locations={locations}
                language={language}
                translations={activeTranslations}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Edit Corporate Record Form Modal overlay (ST_12 & ST_15) */}
      <AnimatePresence>
        {showEditModal && editingBusiness && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl h-[90vh] md:h-auto overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6"
            >
              
              {/* Form title header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-sans font-bold text-slate-800 text-lg">
                  {isNewListing 
                    ? (language === 'ar' ? 'إضافة سجل تجاري جديد' : 'Instate New Record') 
                    : activeTranslations.editListingTitle}
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                
                {/* Field corporate name */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 uppercase font-mono text-[9px] block">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBusiness.business_name || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, business_name: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="e.g. Damascus Charcoal Grills"
                  />
                </div>

                {/* Field Category */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Main Category</label>
                  <select
                    value={editingBusiness.category_id || 'restaurants'}
                    onChange={(e) => setEditingBusiness({...editingBusiness, category_id: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>
                    ))}
                  </select>
                </div>

                {/* Field Subcategory */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Service Subcategory</label>
                  <select
                    value={editingBusiness.subcategory_id || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, subcategory_id: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                  >
                    <option value="">No subcategory</option>
                    {categories.find(c => c.id === editingBusiness.category_id)?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                    ))}
                  </select>
                </div>

                {/* Field Governorate */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Governorate</label>
                  <select
                    value={editingBusiness.governorate || 'baghdad'}
                    onChange={(e) => {
                      const chosenGov = locations.find(g => g.id === e.target.value);
                      setEditingBusiness({
                        ...editingBusiness, 
                        governorate: e.target.value,
                        city: chosenGov?.cities[0]?.id || ''
                      });
                    }}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                  >
                    {locations.map(g => (
                      <option key={g.id} value={g.id}>{language === 'ar' ? g.nameAr : g.nameEn}</option>
                    ))}
                  </select>
                </div>

                {/* Field City */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">City</label>
                  <select
                    value={editingBusiness.city || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, city: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                  >
                    {locations.find(g => g.id === editingBusiness.governorate)?.cities?.map(c => (
                      <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>
                    ))}
                  </select>
                </div>

                {/* Address details */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 uppercase font-mono text-[9px] block">Address Line & Area Description</label>
                  <input
                    type="text"
                    value={editingBusiness.address || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, address: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="e.g. Al-Mansour Street, opposite to Rawad Intersection"
                  />
                </div>

                {/* Phone contact */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Phone / Mobile Line</label>
                  <input
                    type="text"
                    value={editingBusiness.phone_number || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, phone_number: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="e.g. 0770 123 4567"
                  />
                </div>

                {/* WhatsApp override */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">WhatsApp override (if different)</label>
                  <input
                    type="text"
                    value={editingBusiness.whatsapp_number || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, whatsapp_number: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="e.g. 07701234567"
                  />
                </div>

                {/* Social links */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Facebook link</label>
                  <input
                    type="text"
                    value={editingBusiness.facebook_url || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, facebook_url: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="https://facebook.com/kebab"
                  />
                </div>

                {/* Web Link */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px] block">Website</label>
                  <input
                    type="text"
                    value={editingBusiness.website || ''}
                    onChange={(e) => setEditingBusiness({...editingBusiness, website: e.target.value})}
                    className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2 px-3 border border-slate-100 focus:outline-none"
                    placeholder="https://mybusiness.com"
                  />
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  {activeTranslations.close}
                </button>
                <button
                  onClick={handleSaveBusiness}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans"
                >
                  {activeTranslations.saveChanges}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
