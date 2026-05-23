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
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Governorate, Category, Business } from './types';
import DirectoryView from './components/DirectoryView';
import AdminDashboard from './components/AdminDashboard';
import ScraperView from './components/ScraperView';
import ExportPipeline from './components/ExportPipeline';

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
    close: "Close",
    exportTab: "Export & Pipeline"
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
    close: "إغلاق",
    exportTab: "تصدير ومعالجة البيانات"
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
    close: "داخستن",
    exportTab: "تەنسیق و هەناردەکردن"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'scrape' | 'admin' | 'export'>('directory');
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
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Visual Navigation Header Banner (Sleek Theme) */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0 z-40">
        
        {/* Left Side: Logo Brand Title (Sleek styled IQ logo box with Indigo key accent) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            IQ
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-bold leading-none tracking-tight text-slate-800 uppercase flex items-center gap-2">
              <span>{activeTranslations.title}</span>
            </h1>
            <span className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">
              {language === 'ar' ? 'البوابة الذكية لمحترفي جمع البيانات والمشترين' : 'Scraper & Directory Core Platform'}
            </span>
          </div>
        </div>

        {/* Dynamic visual placeholder for search focus from styling mockup */}
        <div className="hidden lg:flex flex-1 max-w-xl px-12">
          <div className="relative w-full">
            <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 text-slate-400`}>
              <Search className="h-4.5 w-4.5" />
            </div>
            <input 
              type="text" 
              disabled
              placeholder={language === 'ar' ? 'البحث مطهر ومثالي من خلال الدليل...' : 'Authorized Iraqi Geographic Core Directory...'}
              className={`w-full py-2 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-slate-100 border-none rounded-full text-xs text-slate-500 focus:outline-none placeholder-slate-400`}
            />
          </div>
        </div>

        {/* Right Actions: Language Selector, Add button & User icon space */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Multilingual Selector (EN / AR / KU) - Styled like Sleek mockup */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-0.5 border border-slate-200">
            {[
              { value: 'ar', label: 'عربي' },
              { value: 'ku', label: 'كردي' },
              { value: 'en', label: 'EN' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setLanguage(item.value as any)}
                className={`text-[10px] md:text-xs font-sans px-2.5 py-1.5 rounded-lg font-semibold transition duration-150 ${language === item.value ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Add New Listing Trigger Button - styled in Sleek Indigo style */}
          <button
            onClick={handleOpenNewListingForm}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition duration-150"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{activeTranslations.addBusinessButton}</span>
          </button>

          {/* User profile avatar decoration */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs select-none">
            AD
          </div>
        </div>

      </nav>

      {/* Outer Workspace Frame (Sidebar + Main panel) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation Panel */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 shrink-0 hidden md:flex">
          <div className="space-y-6 flex-1">
            
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-4">
                {language === 'ar' ? 'سير العمل الدائري' : 'Main Workflow'}
              </p>
              <nav className="space-y-1.5">
                {[
                  { id: 'directory', label: activeTranslations.directoryTab, icon: Building2 },
                  { id: 'scrape', label: activeTranslations.scrapeTab, icon: Cpu },
                  { id: 'admin', label: activeTranslations.adminTab, icon: Settings },
                  { id: 'export', label: activeTranslations.exportTab, icon: FileSpreadsheet }
                ].map(tab => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition duration-150 relative text-left ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 border-none' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-650' : 'text-slate-450'}`} />
                      <span className="flex-1 truncate text-left">{tab.label}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator" 
                          className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" 
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Governorates count widget in sidebar */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-2">
                {language === 'ar' ? 'المحافظات الرئيسية' : 'Key Regions'}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { name: language === 'ar' ? 'بغداد' : 'Baghdad', count: '42k' },
                  { name: language === 'ar' ? 'البصرة' : 'Basra', count: '18k' },
                  { name: language === 'ar' ? 'أربيل' : 'Erbil', count: '22k' },
                  { name: language === 'ar' ? 'السليمانية' : 'Sulaymaniyah', count: '15k' },
                  { name: language === 'ar' ? 'نينوى (الموصل)' : 'Mosul', count: '11k' }
                ].map((g, i) => (
                  <div 
                    key={i} 
                    className="text-xs py-1.5 px-2.5 flex justify-between text-slate-600 font-semibold hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <span>{g.name}</span>
                    <span className="text-slate-400 font-normal">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Active status card */}
          <div className="mt-auto">
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <h4 className="text-xs font-bold mb-1">{language === 'ar' ? 'حالة مجمع البيانات' : 'Scraper & Cleanser Status'}</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[9px] font-mono text-slate-300 uppercase tracking-tighter">
                  {language === 'ar' ? 'نشط في بغداد / الكرخ' : 'Active in Baghdad/Karkh'}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-755 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-505 w-3/4 rounded-full bg-indigo-500"></div>
              </div>
              <p className="text-[9px] mt-2 text-slate-400 font-sans">
                {language === 'ar' ? '١٢,٤٠٢ سجل تحت التنظيف والمراجعة' : '12,402 entries pending deduplication clean'}
              </p>
            </div>
          </div>

        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex flex-col">
          
          {/* Mobile Tab Swapper widget */}
          <div className="flex md:hidden bg-white p-1 rounded-2xl border border-slate-200 mb-4 text-xs font-semibold overflow-x-auto shrink-0">
            {[
              { id: 'directory', label: activeTranslations.directoryTab },
              { id: 'scrape', label: activeTranslations.scrapeTab },
              { id: 'admin', label: activeTranslations.adminTab },
              { id: 'export', label: activeTranslations.exportTab }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 text-center py-2 px-3 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Components Swapper block */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + language + reloaderSeq}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
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

                {activeTab === 'export' && (
                  <ExportPipeline 
                    categories={categories}
                    locations={locations}
                    language={language}
                    translations={activeTranslations}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer branding details line */}
          <footer className="mt-8 border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {language === 'ar' ? 'مزامنة الخادم نشطة: زمن الاستجابة ٤٢ ملي ثانية' : 'Server Sync Active: Latency 42ms'}
            </span>
            <span>
              Build: 1.4.0-Iraq_Deploy • Updated 4m ago
            </span>
          </footer>

        </main>

      </div>

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
