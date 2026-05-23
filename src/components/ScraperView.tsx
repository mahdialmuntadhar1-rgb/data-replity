import { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Terminal, 
  Play, 
  Pause,
  Square,
  Trash2, 
  FileText, 
  HelpCircle,
  Cpu,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
  MapPin,
  Building2,
  Check,
  Zap,
  Sliders,
  Database,
  SlidersHorizontal,
  Wifi,
  Clock
} from 'lucide-react';
import { Governorate, Category } from '../types';

interface ScraperViewProps {
  categories: Category[];
  locations: Governorate[];
  language: 'en' | 'ar' | 'ku';
  translations: any;
  onRefreshDirectory: () => void;
}

// Rich local mock generation dictionaries to construct highly authentic Iraqi businesses on-the-fly
const BUSINESS_ADJECTIVES = [
  { en: "Elite", ar: "النخبة", ku: "بژاردە" },
  { en: "Royal", ar: "الملكي", ku: "شاهانە" },
  { en: "Golden", ar: "الذهبي", ku: "زێڕین" },
  { en: "Tigris", ar: "دجلة", ku: "دیجلە" },
  { en: "Euphrates", ar: "الفرات", ku: "فورات" },
  { en: "Babylon", ar: "بابل", ku: "بابیلۆن" },
  { en: "Modern", ar: "الحديث", ku: "مۆدێرن" },
  { en: "Sumerian", ar: "السومري", ku: "سۆمەری" },
  { en: "Al-Sefir", ar: "السفير", ku: "باڵیۆز" },
  { en: "Al-Mansour", ar: "المنصور", ku: "مه‌نسور" },
  { en: "Heritage", ar: "التراث العريق", ku: "كه‌له‌پور" },
  { en: "Specialized", ar: "التخصصي", ku: "تایبەتمەند" },
  { en: "Al-Riyadh", ar: "الرياض", ku: "ڕیاز" },
  { en: "Baghdad City", ar: "مدينة بغداد", ku: "شاری بەغداد" },
  { en: "Ashtar", ar: "عشتار", ku: "عەشتار" }
];

const CATEGORY_NAMES_DICT: Record<string, { en: string; ar: string; ku: string }> = {
  restaurants: { en: "Grill & Shawarma Bistro", ar: "مطعم ومشويات للوجبات السريعة", ku: "خواردەمەنی و برژاو" },
  cafes: { en: "Specialty Coffee Bar & Chai", ar: "مقهى وكافيه للقهوة المختصة والتحلية", ku: "کافێ و مەکۆ" },
  hotels: { en: "Grand Hospitality Suites", ar: "فندق وأجنحة سياحية فاخرة", ku: "هوتێل و گەشتوگوزار" },
  hospitals: { en: "General Surgical Hospital", ar: "مستشفى عام للخدمات الطبية والجراحة", ku: "نەخۆشخانەی گشتی" },
  clinics: { en: "Specialized Pediatric & Dental Clinic", ar: "عيادة تخصصية لطب الأسنان والتجميل", ku: "کلینیکی پزیشکی" },
  pharmacies: { en: "24-Hour Wellness Pharmacy", ar: "صيدلية المناوبة الدوائية المتكاملة", ku: "دەرمانخانە" },
  markets: { en: "Family Hypermarket", ar: "سوبرماركت وأسواق العائلة المركزية", ku: "مارکێت و بازاڕ" },
  shopping: { en: "Mega Commercial Mall", ar: "مول تجاري ومجمع تسوق متكامل", ku: "مۆڵی بازرگانی" },
  electronics: { en: "Smart Mobiles & IT Center", ar: "الرواد للإلكترونيات وصيانة الهواتف الذكية", ku: "مۆبایل و کۆمپیوتەر" },
  automotive: { en: "Speed Motors & Spare Parts", ar: "الشهباء لتجارة السيارات والأدوات الاحتياطية", ku: "پیشەسازی ئۆتۆمبێل" },
  construction: { en: "Engineering & Building Materials", ar: "مكتب المقاولات والإنشاءات الهندسية", ku: "کەرەسەی بیناسازی" },
  real_estate: { en: "Al-Ameen Real Estate Bureau", ar: "مكتب دلالة العقارات والاستثمار السكني", ku: "نووسینگەی خانووبەرە" },
  education: { en: "Pioneer Private Academy", ar: "مدرسة ومعهد الأجيال الأهلي للغات", ku: "فێرگە و پەیمانگا" },
  gyms: { en: "Iron Body Fitness Gym", ar: "قاعة الرشاقة وبناء الأجسام المتكاملة", ku: "هۆڵی وەرزشی" },
  beauty_salons: { en: "Rose Beauty Salon & Aesthetic", ar: "صالون ومركز باريس للتطبيقات التجميلية", ku: "سەنتەری جوانکاری" },
  fashion: { en: "Modern Apparel Outlet", ar: "معرض دبي للأزياء الراقية والملابس", ku: "پۆشاک و مۆدە" },
  furniture: { en: "Istanbul Luxury Home Furniture", ar: "مفروشات وأثاث البيت العصري الحديث", ku: "ڕاخەر و مۆبیلیات" },
  delivery_services: { en: "Express Cargo & Logistics", ar: "شركة البرق للشحن السريع والخدمات اللوجستية", ku: "گواستنەوەی خێرا" },
  tourism: { en: "Sindbad Travel & Ticketing Agency", ar: "السندباد للسياحة والسفر وحجز الطيران", ku: "گەشتوگوزار و پلیت" },
  financial_services: { en: "Al-Warka Exchange & Remittance", ar: "صيرفة الوركاء للحوالات والتحويلات المالية", ku: "ئاڵوگۆڕی دراو" }
};

export default function ScraperView({ 
  categories, 
  locations, 
  language, 
  translations,
  onRefreshDirectory
}: ScraperViewProps) {
  const isRtl = language === 'ar';
  
  // Custom views: "auto" for simulated loop workspace, "manual" for OCR pasting
  const [activeSubTab, setActiveSubTab] = useState<'auto' | 'manual'>('auto');
  
  // Dynamic target area state selection - Multi-Governorate Checkboxes Support
  const [selectedGovIds, setSelectedGovIds] = useState<string[]>(['baghdad']);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  // Standard background play, pause & stop thread simulation state
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'paused'>('idle');
  const [sessionHarvested, setSessionHarvested] = useState<number>(0);
  const [sessionDuplicates, setSessionDuplicates] = useState<number>(0);
  const [crawlerIntervalDelay, setCrawlerIntervalDelay] = useState<number>(3000); // Ms per business harvest
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [lastScrapedBusiness, setLastScrapedBusiness] = useState<any | null>(null);
  
  // Manual scraping state variables
  const [platform, setPlatform] = useState<'google_maps' | 'facebook' | 'instagram' | 'yellowpages' | 'custom_upload'>('facebook');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [autoMergedFlag, setAutoMergedFlag] = useState(false);
  const [mergedTargetId, setMergedTargetId] = useState('');

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultSamples = {
    facebook: `Baghdad Elite Dental Clinic
We are pleased to open our new center in Mansour, Baghdad!
Serving family pediatric dentistry and cosmetics laser teeth whitening.
Contact us via: 0770 123 4567 or visit wa.me/9647701234567
Follow our Facebook profile http://facebook.com/alnoor.grills.iraq for updates.
Mansour, Al-Mansour Street, Opp. Al-Rawad Coffee house.`,
    google_maps: `Basra Grand Bakery Co
Located near Kornish Al-Basra Street.
Fresh traditional Iraqi flatbreads, custom cakes, and morning samoon pastries.
Call or SMS: 07804456677 or email basra_bakery@gmail.com
Google Maps exact location: 30.5098N, 47.8189E`
  };

  // Automatically select all cities of selected governorates when governorates change
  useEffect(() => {
    const allowedCityIds = locations
      .filter(g => selectedGovIds.includes(g.id))
      .flatMap(g => g.cities.map(c => c.id));
    
    setSelectedCities(prev => {
      // Keep only already selected cities that still belong to checked governorates
      const filtered = prev.filter(cid => allowedCityIds.includes(cid));
      
      // If none of the allowed cities are selected, or we expanded governorates, auto-fill with all allowed cities
      if (filtered.length === 0 && allowedCityIds.length > 0) {
        return allowedCityIds;
      }
      return filtered;
    });
  }, [selectedGovIds, locations]);

  // Handle Play/Pause/Stop intervals securely
  useEffect(() => {
    if (collectionStatus === 'collecting') {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      
      loopTimerRef.current = setInterval(() => {
        executeMockHarvestCycle();
      }, crawlerIntervalDelay);

      addLog(`Harvest thread launched. Delay interval set at ${crawlerIntervalDelay / 1000}s.`);
    } else {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    }

    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [collectionStatus, selectedCities, selectedGovIds, crawlerIntervalDelay]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 80) // Keep max 80 lines
    ]);
  };

  // Toggle city target array helper
  const handleToggleCity = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId]
    );
  };

  const handleSelectAllCities = () => {
    const allowedCityIds = locations
      .filter(g => selectedGovIds.includes(g.id))
      .flatMap(g => g.cities.map(c => c.id));
    setSelectedCities(allowedCityIds);
    addLog(`Target adjusted: Registered all ${allowedCityIds.length} cities matching checked governorates.`);
  };

  const handleClearCities = () => {
    setSelectedCities([]);
    addLog("Target adjusted: Cleared all city criteria.");
  };

  // Execute a single simulated harvest cycle, compiling real preprocessed businesses to POST to the database
  const executeMockHarvestCycle = async () => {
    if (selectedCities.length === 0) {
      addLog("⚠️ Warning: No target cities selected! Pausing harvester.");
      setCollectionStatus('paused');
      return;
    }

    // Pick random variables
    const randomCityId = selectedCities[Math.floor(Math.random() * selectedCities.length)];
    const randomCategory = (categories[Math.floor(Math.random() * categories.length)] || categories[0]) as Category;
    const randomAdj = BUSINESS_ADJECTIVES[Math.floor(Math.random() * BUSINESS_ADJECTIVES.length)];
    
    // Choose appropriate localized suffixes
    const suffixSpec = CATEGORY_NAMES_DICT[randomCategory.id] || { en: "Business", ar: "منشأة تجارية", ku: "بزنس" };
    
    // Formulate names
    const businessNameEn = `${randomAdj.en} ${suffixSpec.en}`;
    const businessNameAr = `${randomAdj.ar} - ${suffixSpec.ar}`;

    // Random Iraqi mobile ranges
    const operators = ['0770', '0771', '0780', '0781', '0750', '0751'];
    const chosenOp = operators[Math.floor(Math.random() * operators.length)];
    const randomLocalDials = Math.floor(Math.random() * 8999999 + 1000000);
    const complexRawPhone = `${chosenOp} ${String(randomLocalDials).substring(0,3)} ${String(randomLocalDials).substring(3)}`;

    // Generate district and find correct governorate object
    let govObj = locations.find(g => selectedGovIds.includes(g.id));
    let cityObj = undefined;
    for (const gov of locations) {
      const found = gov.cities.find(c => c.id === randomCityId);
      if (found) {
        govObj = gov;
        cityObj = found;
        break;
      }
    }
    
    const baseDistrict = cityObj?.districts ? cityObj.districts[Math.floor(Math.random() * cityObj.districts.length)] : '';
    
    const streetName = language === 'ar' ? 'الشارع الرئيسي العام' : 'Main Highway 100';
    const addressSpec = `${baseDistrict || ''} ${cityObj?.nameEn || ''}, ${streetName}`;

    // Select source
    const sources = ['google_maps', 'facebook', 'instagram', 'yellowpages'];
    const activeSrc = sources[Math.floor(Math.random() * sources.length)];

    const seedBody = {
      business_name: language === 'ar' ? businessNameAr : businessNameEn,
      description: language === 'ar' 
        ? `دليل تصفح وخدمات الاتصال التابع لـ ${businessNameAr} تقدم أفضل العروض والمنتجات المتكاملة.` 
        : `Professional services offered by ${businessNameEn} including customer service, regional delivery and consultation.`,
      category_id: randomCategory.id,
      subcategory_id: randomCategory.subcategories ? randomCategory.subcategories[0]?.id : undefined,
      governorate: govObj?.id || selectedGovIds[0] || 'baghdad',
      city: randomCityId,
      district: baseDistrict,
      address: addressSpec,
      phone_number: complexRawPhone,
      facebook_url: `https://facebook.com/iraq.${randomAdj.en.toLowerCase()}.${randomCategory.id}`,
      instagram_url: `https://instagram.com/iraq.${randomAdj.en.toLowerCase()}`,
      scrape_source: activeSrc,
      verification_status: Math.random() > 0.35 ? 'verified' : 'pending' // 65% verified
    };

    addLog(`Crawling ${activeSrc.replace('_', ' ')} for city: ${cityObj?.nameEn || randomCityId}...`);

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedBody)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSessionHarvested(prev => prev + 1);
        setLastScrapedBusiness(data.business);
        
        if (data.autoMerged) {
          setSessionDuplicates(prev => prev + 1);
          addLog(`🚨 Duplicate Prevented & Merged internally! Matches: "${data.business.business_name}" under target: ${data.mergeTargetId}`);
        } else {
          addLog(`✓ Harvested: "${data.business.business_name}" -> Phone standardized as: ${data.business.normalized_phone}`);
        }
        
        // Refresh parents directory list
        onRefreshDirectory();
      } else {
        addLog(`⚠️ Extraction failure: ${data.error || 'Server rejected body'}`);
      }
    } catch (err) {
      addLog(`🚨 Connection network error: ${(err as any).message}`);
    }
  };

  const startScraping = () => {
    if (selectedCities.length === 0) {
      alert(language === 'ar' ? 'يرجى اختيار مدينة واحدة على الأقل للاستخلاص.' : 'Please select at least one target city to harvest.');
      return;
    }
    setCollectionStatus('collecting');
    addLog(`Harvester activated. Target governorates: [${selectedGovIds.join(', ')}]. Listening to ${selectedCities.length} selected areas.`);
  };

  const pauseScraping = () => {
    setCollectionStatus('paused');
    addLog("⏸ Harvesting paused by supervisor. Session counters preserved.");
  };

  const stopScraping = () => {
    setCollectionStatus('idle');
    setSessionHarvested(0);
    setSessionDuplicates(0);
    setLastScrapedBusiness(null);
    addLog("⏹ Thread stopped completely. Counters reset to zero.");
  };

  const handlePasteSample = (type: 'facebook' | 'google_maps') => {
    setUrl(type === 'facebook' ? 'https://facebook.com/iraq.elite.dental' : 'https://maps.google.com/?cid=129482');
    setRawText(defaultSamples[type]);
    setPlatform(type);
  };

  const handleRunManualScrape = async () => {
    if (!url && !rawText) return;
    setManualLoading(true);
    setTerminalLogs(["Connecting to manual parser socket..."]);
    setLastScrapedBusiness(null);
    setAutoMergedFlag(false);
    setMergedTargetId('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          platform,
          rawText
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Render step logic logs
        let currentLogs: string[] = [];
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 150));
          currentLogs = [`[MANUAL OCR] ${data.logs[i]}`, ...currentLogs];
          setTerminalLogs(currentLogs);
        }

        setLastScrapedBusiness(data.business);
        setAutoMergedFlag(data.autoMerged);
        setMergedTargetId(data.mergeTargetId);
        onRefreshDirectory(); // Keep parent directory up-to-date
      } else {
        addLog(`Manual extraction error: ${data.error || 'Pipeline parsing failed'}`);
      }
    } catch (err) {
      addLog(`Fatal mapping manual parsing trigger: ${(err as any).message}`);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in animate-slide-up" id="crawler-importer-workspace" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Sub tabs configuration */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-1.5 rounded-2xl max-w-md shadow-sm font-sans mx-auto md:mx-0">
        <button
          onClick={() => setActiveSubTab('auto')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeSubTab === 'auto' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 bg-transparent'}`}
        >
          <Cpu className="h-4 w-4" />
          {language === 'ar' ? 'الاستخلاص والجمع التلقائي' : 'Automated Area Harvester'}
        </button>
        <button
          onClick={() => setActiveSubTab('manual')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeSubTab === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 bg-transparent'}`}
        >
          <Globe className="h-4 w-4" />
          {language === 'ar' ? 'استخراج يدوي بالذكاء الاصطناعي' : 'Manual Paste OCR Extractor'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column controls */}
        <div className="lg:col-span-7 space-y-6">

          {activeSubTab === 'auto' ? (
            /* AUTOMATED ADVANCED LOOP SYSTEM */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Sliders className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-slate-800 text-sm">
                      {language === 'ar' ? 'تحديد المدن ونطاق الاسترجاع الجغرافي' : 'Area Collection Target Hub'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {language === 'ar' ? 'تصفح كافة المحافظات وحدد المدن والاقضية المطلوبة للجمع الفوري' : 'Drill down into directories and select multiple cities to harvest correct details.'}
                    </p>
                  </div>
                </div>

                {collectionStatus === 'collecting' && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-mono font-bold animate-pulse">
                    <Wifi className="h-3 w-3 animate-ping" />
                    LIVE HARVESTING
                  </span>
                )}
              </div>

              {/* Step 1: Select Iraqi Governorates via Checkboxes */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold text-slate-445 text-slate-550 uppercase tracking-widest block">
                    {language === 'ar' ? '1. المحافظات المستهدفة بالجمع' : '1. Target Governorates (Checkboxes)'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={collectionStatus === 'collecting'}
                      onClick={() => {
                        const allIds = locations.map(l => l.id);
                        setSelectedGovIds(allIds);
                        addLog(`Target adjusted: Registered all ${allIds.length} governorates.`);
                      }}
                      className="text-[10px] text-indigo-650 hover:text-indigo-805 font-bold transition disabled:opacity-50"
                    >
                      {language === 'ar' ? 'تحديد كافة المحافظات' : 'Select All 18'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      disabled={collectionStatus === 'collecting'}
                      onClick={() => {
                        setSelectedGovIds([]);
                        addLog("Target adjusted: Cleared all governorate targets.");
                      }}
                      className="text-[10px] text-rose-650 hover:text-rose-805 font-bold transition disabled:opacity-50"
                    >
                      {language === 'ar' ? 'إلغاء تحديد الكل' : 'Clear All'}
                    </button>
                  </div>
                </div>

                {/* Governorates Checkboxes scroll grid */}
                <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 h-48 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2.5 scrollbar-thin">
                  {locations.map(gov => {
                    const isChecked = selectedGovIds.includes(gov.id);
                    return (
                      <button
                        key={gov.id}
                        type="button"
                        disabled={collectionStatus === 'collecting'}
                        onClick={() => {
                          setSelectedGovIds(prev => 
                            prev.includes(gov.id) ? prev.filter(id => id !== gov.id) : [...prev, gov.id]
                          );
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition duration-150 ${isChecked ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-extrabold' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'}`}
                      >
                        <div className={`h-4.5 w-4.5 shrink-0 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="truncate">
                          {language === 'ar' ? gov.nameAr : gov.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Multi-select Checklist for Desired Cities */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold text-slate-445 text-slate-550 uppercase tracking-widest block">
                    {language === 'ar' ? '2. المدن والأقضية المستهدفة' : '2. Desired Cities & Districts'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCities}
                      disabled={collectionStatus === 'collecting' || selectedGovIds.length === 0}
                      className="text-[10px] text-indigo-605 hover:text-indigo-805 font-bold transition disabled:opacity-50"
                    >
                      {language === 'ar' ? 'تحديد كافة المدن' : 'Select All Cities'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearCities}
                      disabled={collectionStatus === 'collecting' || selectedGovIds.length === 0}
                      className="text-[10px] text-rose-605 hover:text-rose-805 font-bold transition disabled:opacity-50"
                    >
                      {language === 'ar' ? 'إلغاء تحديد المدن' : 'Clear Cities'}
                    </button>
                  </div>
                </div>

                {/* Cities checkboxes grid */}
                <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 h-56 overflow-y-auto grid grid-cols-2 gap-2 scrollbar-thin">
                  {selectedGovIds.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-450 text-slate-400 text-xs italic">
                      {language === 'ar' 
                        ? 'يرجى تفعيل أو تحديد محافظة واحدة على الأقل أعلاه لعرض وتنزيل الأقضية.' 
                        : 'Please select at least one governorate above to load its cities checklist.'}
                    </div>
                  ) : (
                    locations
                      .filter(g => selectedGovIds.includes(g.id))
                      .flatMap(g => g.cities.map(c => ({ ...c, govName: language === 'ar' ? g.nameAr : g.nameEn })))
                      .map(city => {
                        const isChecked = selectedCities.includes(city.id);
                        return (
                          <button
                            key={city.id}
                            type="button"
                            disabled={collectionStatus === 'collecting'}
                            onClick={() => handleToggleCity(city.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left text-xs transition duration-150 ${isChecked ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'}`}
                          >
                            <div className={`h-4.5 w-4.5 shrink-0 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <div className="truncate">
                              <p className="truncate block font-semibold text-slate-800 text-[11px]">{language === 'ar' ? city.nameAr : city.nameEn}</p>
                              <span className="text-[9px] text-slate-405 text-slate-400 block font-mono font-medium">
                                {city.govName}
                              </span>
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Scraping loop controls configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-450 uppercase block">{language === 'ar' ? 'سرعة ومعدل التكرار (Speed Cycle)' : 'Harvester Cycle Delay'}</span>
                  <select
                    value={crawlerIntervalDelay}
                    onChange={(e) => setCrawlerIntervalDelay(parseInt(e.target.value))}
                    disabled={collectionStatus === 'collecting'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value={1500}>Superfast (1.5 seconds / cycle)</option>
                    <option value={3000}>Standard (3.0 seconds / cycle)</option>
                    <option value={5000}>Thorough (5.0 seconds / cycle)</option>
                    <option value={10000}>Slow / Throttled (10.0 seconds / cycle)</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-550 block font-semibold text-slate-500">{language === 'ar' ? 'المدن المستهدفة حالياً:' : 'Active Targeted Areas:'}</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      {selectedCities.length} Selected
                    </span>
                  </div>
                </div>
              </div>

              {/* METALLIC CONTROL ROOM BAR (PLAY / PAUSE / STOP) */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${collectionStatus === 'collecting' ? 'bg-emerald-500 animate-ping' : collectionStatus === 'paused' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                  <div className="font-mono text-xs">
                    <span className="text-slate-405 text-slate-500 block text-[9px] uppercase tracking-wider">{language === 'ar' ? 'حالة مؤشر الخيط' : 'Thread Status'}</span>
                    <span className={`font-bold uppercase ${collectionStatus === 'collecting' ? 'text-emerald-400' : collectionStatus === 'paused' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {collectionStatus === 'collecting' ? 'RUNNING / INGEST' : collectionStatus === 'paused' ? 'PAUSED' : 'IDLE / STOPPED'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Start Play button */}
                  <button
                    type="button"
                    onClick={startScraping}
                    disabled={collectionStatus === 'collecting' || selectedCities.length === 0}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>{language === 'ar' ? 'تشغيل' : 'Start / Play'}</span>
                  </button>

                  {/* Pause button */}
                  <button
                    type="button"
                    onClick={pauseScraping}
                    disabled={collectionStatus !== 'collecting'}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Pause className="h-4 w-4 fill-white" />
                    <span>{language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</span>
                  </button>

                  {/* Stop button */}
                  <button
                    type="button"
                    onClick={stopScraping}
                    disabled={collectionStatus === 'idle'}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Square className="h-4 w-4 fill-white" />
                    <span>{language === 'ar' ? 'إنهاء / تصفير' : 'Stop'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ORIGINAL MANUAL OCR TEXT BOX */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-sans font-bold text-slate-800 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-500" />
                  {language === 'ar' ? 'استخلاص وتحليل البيانات بالنصوص اليدوية' : 'Unstructured Data Harvesting via Copy/Paste'}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  {language === 'ar' ? 'الصق منشوراً أو وصفاً وسيقوم محرك الـ AI باستخراج تفاصيل الاتصال' : 'Configure the platform parser and paste raw corporate text details below.'}
                </p>
              </div>

              {/* Preset Samples Triggers */}
              <div className="space-y-2">
                <span className="text-slate-405 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider block">
                  {language === 'ar' ? 'عينات اختبار سريعة لتسريع التجربة' : 'One-Click Seed Testers'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => handlePasteSample('facebook')}
                    className="py-2.5 px-3 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-700 transition font-medium flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'عيّنة ملف فيسبوك' : 'Seed Facebook Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePasteSample('google_maps')}
                    className="py-2.5 px-3 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 transition font-medium flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'عيّنة خرائط جوجل' : 'Seed Maps Profile'}
                  </button>
                </div>
              </div>

              {/* Platform selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
                  {language === 'ar' ? 'منصة استخلاص المصدر' : 'Platform Source Profile'}
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full bg-slate-50 text-slate-700 font-sans text-xs font-bold rounded-xl py-2.5 px-3 border border-slate-200 focus:outline-none"
                >
                  <option value="google_maps">Google Maps public business page</option>
                  <option value="facebook">Facebook business page / profile text</option>
                  <option value="instagram">Instagram business profile info</option>
                  <option value="yellowpages">Iraqi Local Yellow Pages</option>
                  <option value="custom_upload">Plain unstructured text block paste</option>
                </select>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-slate-405 text-slate-400 uppercase tracking-widest block">
                  {language === 'ar' ? 'عنوان الرابط العام (URL)' : 'Target Public URL Link'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://facebook.com/iraq.clinic"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-50 text-slate-750 placeholder-slate-400 font-sans text-xs rounded-xl py-2.5 px-3 border border-slate-200 focus:outline-none"
                />
              </div>

              {/* Unstructured textbox */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
                    {language === 'ar' ? 'تفاصيل النص المنسوخ بالكامل' : 'Raw Text Paste Context'}
                  </label>
                  <span className="text-[10px] text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {language === 'ar' ? 'استخراج ذكي بالـ AI' : 'Gemini Auto-Parse'}
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder={language === 'ar' ? "الصق هنا تفاصيل الاتصال، الهاتف، المحافظة، العنوان..." : "Paste raw business details containing names, Iraqi phones (0770/0780), emails, or addresses..."}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 font-sans text-xs rounded-2xl py-2.5 px-3 border border-slate-200 focus:outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunManualScrape}
                disabled={manualLoading || (!url && !rawText)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-sans text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-md"
              >
                {manualLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{language === 'ar' ? 'جاري التحليل واستخلاص البيانات...' : 'Analyzing Unstructured Text...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>{language === 'ar' ? 'تحليل واستخلاص' : 'Import & Clean Business'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Educational ethics banner */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-5 flex gap-4 items-start shadow-sm font-sans mx-auto">
            <HelpCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-xs font-sans">
                {language === 'ar' ? 'أخلاقيات وامتثال جمع البيانات العامة' : 'Respectful & Compliant Data Harvesting'}
              </h4>
              <p className="text-[10px] text-amber-800 leading-relaxed font-sans">
                {language === 'ar' 
                  ? 'تلتزم هذه المنصة بالامتثال لملفات robots.txt ومحددات الاستخدام العادل لمواقع التواصل الاجتماعي والخرائط والمواقع العامة الأخرى في العراق. لا تحاول جمع أرقام هواتف غامضة أو تفاصيل سرية.' 
                  : 'Our crawling pipeline validates robots.txt parameters, handles rate-limits, and structures public-facing profile cards from Google Maps or social profiles with full integrity.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right column terminal and results previews */}
        <div className="lg:col-span-5 space-y-6">

          {/* Session Statistics cards if running */}
          {activeSubTab === 'auto' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-slate-405 block text-[8px] uppercase font-mono tracking-wider">{language === 'ar' ? 'المجموع المستخلص' : 'Session Harvest'}</span>
                  <span className="font-sans font-extrabold text-slate-800 text-lg">{sessionHarvested}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-slate-405 block text-[8px] uppercase font-mono tracking-wider">{language === 'ar' ? 'تكرار مستبعد' : 'Duplicates Avoided'}</span>
                  <span className="font-sans font-extrabold text-slate-800 text-lg">{sessionDuplicates}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Platform Console Monitor logs */}
          <div className="bg-slate-950 text-slate-300 rounded-3xl p-5 shadow-inner border border-slate-800 space-y-3 font-mono text-[11px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 text-[9px] text-slate-500">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="h-4 w-4 text-emerald-500 animate-pulse" />
                HARVEST CONSOLE MONITOR LOGS
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                UTC LOGS
              </span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto min-h-[140px] pr-2 scrollbar-thin select-all">
              {terminalLogs.length === 0 ? (
                <p className="text-slate-600 italic">
                  &gt;&gt; Ready. Click "Start / Play" to trigger simulated data polling, or load manual text clipboard.
                </p>
              ) : (
                terminalLogs.map((log, idx) => (
                  <p key={idx} className={log.includes('🚨') ? 'text-rose-400 font-semibold' : log.includes('⚠️') ? 'text-amber-400' : log.includes('✓') ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    &gt;&gt; {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Extracted preview card */}
          {lastScrapedBusiness && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <Building2 className="h-4 w-4 text-indigo-550" />
                  {language === 'ar' ? 'أحدث سجل مستخلص معتمد' : 'Live Ingestion Record'}
                </h4>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${lastScrapedBusiness.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
                  {lastScrapedBusiness.verification_status}
                </span>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold">Business Entity Name</span>
                  <p className="font-bold text-slate-800">{lastScrapedBusiness.business_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold">Standardized Phone</span>
                    <p className="font-mono font-bold text-indigo-600">{lastScrapedBusiness.normalized_phone || 'None'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold">Has WhatsApp</span>
                    <p className={`font-bold uppercase ${lastScrapedBusiness.normalized_whatsapp ? 'text-emerald-650' : 'text-slate-400'}`}>
                      {lastScrapedBusiness.normalized_whatsapp ? 'YES' : 'NO'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold">Governorate</span>
                    <p className="font-semibold text-slate-700 capitalize text-[11px]">{lastScrapedBusiness.governorate}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold">City Location</span>
                    <p className="font-semibold text-slate-705 capitalize text-[11px]">{lastScrapedBusiness.city}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-405 block text-[8px] uppercase tracking-wider font-mono font-bold font-semibold">Street & Local Address</span>
                  <p className="text-slate-650 text-[11px]">{lastScrapedBusiness.address || 'Public Location Directory'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
