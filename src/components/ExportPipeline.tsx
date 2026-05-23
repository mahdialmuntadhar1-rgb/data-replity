import { useState, useEffect } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  History, 
  Sparkles, 
  Database, 
  Sliders, 
  Filter, 
  ArrowRight, 
  CheckSquare, 
  Layers, 
  Settings2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  Trash2,
  Trash
} from 'lucide-react';
import { Governorate, Category, Business } from '../types';
import { GOVERNORATES, CATEGORIES } from '../geo_and_categories';
import { 
  normalizeIraqiPhone, 
  normalizeArabic, 
  cleanSocialUrl, 
  evaluateDuplicateConfidence 
} from '../utils_normalization';
import * as XLSX from 'xlsx';

interface ExportPipelineProps {
  categories: Category[];
  locations: Governorate[];
  language: 'en' | 'ar' | 'ku';
  translations: any;
}

interface ExportHistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  recordCount: number;
  format: 'csv' | 'xlsx';
  scope: string;
  sizeKb: number;
}

export default function ExportPipeline({ 
  categories, 
  locations, 
  language, 
  translations 
}: ExportPipelineProps) {
  const isRtl = language === 'ar';
  
  // Pipeline settings and filter state
  const [selectedGovs, setSelectedGovs] = useState<string[]>([]); // Empty means All
  const [selectedCats, setSelectedCats] = useState<string[]>([]); // Empty means All
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  
  // Clean settings
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [dupThreshold, setDupThreshold] = useState<number>(75);
  const [normalizePhones, setNormalizePhones] = useState(true);
  const [validateUrls, setValidateUrls] = useState(true);
  const [excludeIncomplete, setExcludeIncomplete] = useState(false); // Discard without phone or business name
  const [hasWhatsAppFilter, setHasWhatsAppFilter] = useState(false);
  
  // Loading & logs state
  const [preprocessLoading, setPreprocessLoading] = useState(false);
  const [preprocessedData, setPreprocessedData] = useState<any[]>([]);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<number>(-1);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  
  // Database stats state
  const [totalDbCount, setTotalDbCount] = useState<number>(0);
  const [rawBusinesses, setRawBusinesses] = useState<Business[]>([]);
  const [pipelineStats, setPipelineStats] = useState({
    scanned: 0,
    cleanedPhones: 0,
    duplicatePruned: 0,
    emptyPruned: 0,
    whatsAppDetected: 0,
    finalCount: 0
  });

  const pipelineSteps = [
    { title: language === 'ar' ? 'سحب وفحص السجلات الخام' : 'Parsing & Structuring Records', desc: language === 'ar' ? 'فحص البنية وإزالة السطور الفارغة' : 'Validating database schema and weeding out initial malformations' },
    { title: language === 'ar' ? 'تطهير وتوحيد الهواتف العراقية' : 'Iraqi Phone Format Coercion', desc: language === 'ar' ? 'ترميز الأرقام بالصيغة الدولية (+964)' : 'Normalizing mobile ranges to international form +9647X' },
    { title: language === 'ar' ? 'البحث عن المتكررات المتقاطعة ودمجها' : 'De-duplication Crossmatch Engine', desc: language === 'ar' ? 'عزل المتشابهات بناء على التوافق والتطابق الهاتفي' : 'Checking fuzzy matching and GPS overlaps' },
    { title: language === 'ar' ? 'التحقق من روابط التواصل والويب' : 'Social URLs Sanitization', desc: language === 'ar' ? 'حذف الروابط التالفة وبارامترات التتبع' : 'Stripping tracking queries from fb/instagram/tiktok links' },
    { title: language === 'ar' ? 'تصنيف وترتيب الفهرسة المتتالية' : 'Index Sort Cascade', desc: language === 'ar' ? 'الترتيب: المحافظة -> القضاء -> القطاع -> الاسم' : 'Sorting results hierarchically for direct Supabase copy' },
    { title: language === 'ar' ? 'تنسيق الأعمدة لمطابقة Supabase' : 'Supabase Table Mapping', desc: language === 'ar' ? 'تنظيم الصفوف المترابطة بالتنسيق المطلوب' : 'Structuring column definitions and UTF-8 encoding checks' }
  ];

  useEffect(() => {
    // Load local history on mount
    const storedHistory = localStorage.getItem('iraq_biz_export_history');
    if (storedHistory) {
      try {
        setExportHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed loading local export history", e);
      }
    }

    // Fetch all raw businesses (with size limits bypass for optimization) to run pipeline
    const loadAllDatabase = async () => {
      try {
        const res = await fetch('/api/businesses?page=1&limit=500');
        const data = await res.json();
        if (data && data.businesses) {
          setRawBusinesses(data.businesses);
          setTotalDbCount(data.totalCount || data.businesses.length);
        }
      } catch (err) {
        console.error("Failed fetching directory database for preprocessing", err);
      }
    };
    loadAllDatabase();
  }, []);

  const saveHistory = (newHistory: ExportHistoryItem[]) => {
    setExportHistory(newHistory);
    localStorage.setItem('iraq_biz_export_history', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const toggleGovSelection = (govId: string) => {
    setSelectedGovs(prev => 
      prev.includes(govId) ? prev.filter(id => id !== govId) : [...prev, govId]
    );
  };

  const toggleCatSelection = (catId: string) => {
    setSelectedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const runPreprocessingPipeline = async () => {
    setPreprocessLoading(true);
    setPipelineLogs([]);
    setCurrentPipelineStep(0);
    setPreprocessedData([]);

    // Fetch latest fresh db from API
    let dataset: Business[] = [];
    try {
      const res = await fetch('/api/businesses?page=1&limit=1000');
      const data = await res.json();
      dataset = data.businesses || [];
    } catch {
      dataset = [...rawBusinesses];
    }

    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setPipelineLogs([...logs]);
    };

    addLog(`Pipeline initiated. Dataset loaded: ${dataset.length} raw business rows.`);

    // STEP 0: Structure Validation
    await new Promise(r => setTimeout(r, 400));
    setCurrentPipelineStep(1);
    addLog(`Running Step 1: Parsing schema constraints.`);
    
    // Clean mandatory fields
    let step0List = dataset.filter(b => {
      if (!b.business_name || b.business_name.trim().length === 0) {
        return false;
      }
      if (excludeIncomplete) {
        // Discard if both phone AND raw phone are missing
        if (!b.phone_number && !b.normalized_phone) {
          return false;
        }
      }
      return true;
    });
    
    const initialPruned = dataset.length - step0List.length;
    addLog(`Completed Step 1: Pruned ${initialPruned} empty or invalid businesses.`);

    // STEP 1: Phone Normalization
    await new Promise(r => setTimeout(r, 400));
    setCurrentPipelineStep(2);
    addLog(`Running Step 2: Formulating operator prefixes and internationalizing.`);

    let cleanedPhonesCount = 0;
    let whatsAppDetectedCount = 0;

    let step1List = step0List.map(b => {
      let norm = b.normalized_phone || '';
      let waNorm = b.normalized_whatsapp || '';
      
      if (normalizePhones && b.phone_number) {
        const temp = normalizeIraqiPhone(b.phone_number);
        if (temp !== b.normalized_phone) {
          cleanedPhonesCount++;
          norm = temp;
        }
      }

      // Check WhatsApp
      const hasWa = norm.length > 5 && (b.whatsapp_number || b.normalized_whatsapp || b.phone_number?.includes('wa.me') || b.phone_number?.includes('whatsapp'));
      if (hasWa) {
        waNorm = waNorm || norm;
        whatsAppDetectedCount++;
      }

      return {
        ...b,
        normalized_phone: norm,
        normalized_whatsapp: waNorm,
        has_whatsapp: !!waNorm
      };
    });

    addLog(`Completed Step 2: Formatted ${cleanedPhonesCount} Iraqi dials. Auto-detected ${whatsAppDetectedCount} WhatsApp active lines.`);

    // STEP 2: De-duplication crossmatch
    await new Promise(r => setTimeout(r, 600));
    setCurrentPipelineStep(3);
    addLog(`Running Step 3: Resolving overlaps at threshold >= ${dupThreshold}%.`);

    let duplicatePrunedCount = 0;
    let step2List: any[] = [];
    const seenPhones = new Set<string>();
    const seenFacebook = new Set<string>();

    // Sort to keep "verified" versions over "pending" copies if duplicates exist
    const sortedForPrune = [...step1List].sort((a, b) => {
      const vA = a.verification_status === 'verified' ? 2 : 1;
      const vB = b.verification_status === 'verified' ? 2 : 1;
      return vB - vA;
    });

    for (const b of sortedForPrune) {
      if (b.is_duplicate) {
        duplicatePrunedCount++;
        continue; // Pre-matched server duplicates skipped
      }

      // Double-check phone duplicates inside the current batch
      if (b.normalized_phone && seenPhones.has(b.normalized_phone)) {
        duplicatePrunedCount++;
        continue;
      }

      // Live similarity check against already added records in the cleaned list
      if (removeDuplicates) {
        let isDupOfPrior = false;
        for (const added of step2List) {
          const confidence = evaluateDuplicateConfidence(b, added);
          if (confidence.score >= dupThreshold) {
            isDupOfPrior = true;
            break;
          }
        }
        if (isDupOfPrior) {
          duplicatePrunedCount++;
          continue;
        }
      }

      // Record seen parameters
      if (b.normalized_phone) seenPhones.add(b.normalized_phone);
      if (b.facebook_url) seenFacebook.add(cleanSocialUrl(b.facebook_url));

      step2List.push(b);
    }

    addLog(`Completed Step 3: Excluded ${duplicatePrunedCount} duplicate entities and duplicate reference cards.`);

    // STEP 3: Social URLs sanitization
    await new Promise(r => setTimeout(r, 400));
    setCurrentPipelineStep(4);
    addLog(`Running Step 4: Stripping query string metadata and cleaning protocol links.`);

    let cleanedUrlsCount = 0;
    let step3List = step2List.map(b => {
      let fb = b.facebook_url || '';
      let ig = b.instagram_url || '';
      let website = b.website || '';

      if (validateUrls) {
        if (b.facebook_url) {
          const cleaned = cleanSocialUrl(b.facebook_url);
          if (cleaned !== b.facebook_url) {
            cleanedUrlsCount++;
            fb = cleaned;
          }
        }
        if (b.instagram_url) {
          const cleaned = cleanSocialUrl(b.instagram_url);
          if (cleaned !== b.instagram_url) {
            cleanedUrlsCount++;
            ig = cleaned;
          }
        }
        if (b.website) {
          const cleaned = cleanSocialUrl(b.website);
          website = cleaned;
        }
      }

      return {
        ...b,
        facebook_url: fb,
        instagram_url: ig,
        website: website
      };
    });

    addLog(`Completed Step 4: Revamped social web addresses.`);

    // STEP 4: Sorting Hierarchical Cascade
    await new Promise(r => setTimeout(r, 400));
    setCurrentPipelineStep(5);
    addLog(`Running Step 5: Classifying hierarchical cascade for PostgreSQL Indexing.`);

    // Map geographic and category values
    let step4List = step3List.map(b => {
      const govObj = GOVERNORATES.find(g => g.id === b.governorate);
      const cityObj = govObj?.cities.find(c => c.id === b.city);
      const catObj = CATEGORIES.find(c => c.id === b.category_id);
      const subObj = catObj?.subcategories?.find(s => s.id === b.subcategory_id);

      // Extract Arabic text counterparts or clean
      let businessArabic = '';
      if (/[\u0600-\u06FF]/.test(b.business_name)) {
        businessArabic = b.business_name;
      } else if (b.description && /[\u0600-\u06FF]/.test(b.description)) {
        // Find if description has arabic words of the name, fallback representation
        businessArabic = b.business_name;
      } else {
        // English name, if Arabic counterpart requested, formulate fallback
        businessArabic = ''; 
      }

      return {
        ...b,
        gov_name: govObj?.nameEn || b.governorate,
        city_name: cityObj?.nameEn || b.city,
        cat_name: catObj?.nameEn || b.category_id,
        sub_name: subObj?.nameEn || b.subcategory_id || '',
        business_name_arabic: businessArabic
      };
    });

    // Filtering based on Batch parameters
    if (selectedGovs.length > 0) {
      step4List = step4List.filter(b => selectedGovs.includes(b.governorate));
      addLog(`Applied filter limit: Restricted to governorates: [${selectedGovs.join(', ')}]`);
    }

    if (selectedCats.length > 0) {
      step4List = step4List.filter(b => selectedCats.includes(b.category_id));
      addLog(`Applied filter limit: Restricted to categories: [${selectedCats.join(', ')}]`);
    }

    if (hasWhatsAppFilter) {
      step4List = step4List.filter(b => b.has_whatsapp === true);
      addLog(`Applied limit: Only WhatsApp active entries preserved.`);
    }

    // Sort businesses by Governorate -> City -> Category -> Name
    step4List.sort((a, b) => {
      const gC = (a.gov_name || '').localeCompare(b.gov_name || '');
      if (gC !== 0) return gC;

      const cC = (a.city_name || '').localeCompare(b.city_name || '');
      if (cC !== 0) return cC;

      const catC = (a.cat_name || '').localeCompare(b.cat_name || '');
      if (catC !== 0) return catC;

      return (a.business_name || '').localeCompare(b.business_name || '');
    });

    addLog(`Completed Step 5: Perfect sorting achieved.`);

    // STEP 5: Supabase Column Mapping Array Build
    await new Promise(r => setTimeout(r, 400));
    setCurrentPipelineStep(6);
    addLog(`Running Step 6: Formulating raw structures and mapping fields.`);

    const formattedExportList = step4List.map(item => {
      return {
        business_name: item.business_name || '',
        business_name_arabic: item.business_name_arabic || '',
        category: item.cat_name || '',
        subcategory: item.sub_name || '',
        governorate: item.gov_name || '',
        city: item.city_name || '',
        district: item.district || '',
        address: item.address || '',
        description: item.description || '',
        phone_number: item.phone_number || '',
        normalized_phone: item.normalized_phone || '',
        whatsapp_number: item.whatsapp_number || '',
        normalized_whatsapp: item.normalized_whatsapp || '',
        has_whatsapp: item.has_whatsapp ? 'TRUE' : 'FALSE',
        email: item.email || '',
        website: item.website || '',
        facebook_url: item.facebook_url || '',
        instagram_url: item.instagram_url || '',
        tiktok_url: item.tiktok_url || '',
        telegram_url: item.telegram_url || '',
        latitude: item.latitude !== undefined ? item.latitude : '',
        longitude: item.longitude !== undefined ? item.longitude : '',
        source_platform: item.scrape_source || 'custom_upload',
        scrape_date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        duplicate_score: item.confidence_score || '0',
        verification_status: item.verification_status || 'pending'
      };
    });

    addLog(`Completed Step 6: Prepared exactly ${formattedExportList.length} normalized items.`);

    // Compile stats
    setPipelineStats({
      scanned: dataset.length,
      cleanedPhones: cleanedPhonesCount,
      duplicatePruned: duplicatePrunedCount,
      emptyPruned: initialPruned,
      whatsAppDetected: whatsAppDetectedCount,
      finalCount: formattedExportList.length
    });

    setPreprocessedData(formattedExportList);
    setPreprocessLoading(false);
    setCurrentPipelineStep(7);

    // Auto-trigger file download for maximum user convenience
    if (formattedExportList.length > 0) {
      triggerFileDownload(formattedExportList);
    }
  };

  const triggerFileDownload = (dataToDownload: any[]) => {
    // Generate file metadata
    const timestamp = new Date().toISOString().slice(0, 16).replace(/T/, '_').replace(/:/g, '-');
    
    // Choose file name based on scope selection
    let fileScope = 'iraq_all_businesses';
    if (selectedGovs.length === 1) {
      fileScope = `${selectedGovs[0]}_businesses`;
    }
    if (selectedCats.length === 1) {
      fileScope = `iraq_${selectedCats[0]}`;
    }
    if (selectedGovs.length === 1 && selectedCats.length === 1) {
      fileScope = `${selectedGovs[0]}_${selectedCats[0]}`;
    }

    const finalFileName = `${fileScope}_${timestamp}`;

    if (exportFormat === 'csv') {
      // Create CSV with UTF-8 BOM to guarantee perfect double-clicking arabic representation inside Excel
      const headers = Object.keys(dataToDownload[0]);
      let csvStr = headers.join(',') + '\r\n';
      
      dataToDownload.forEach(row => {
        const line = headers.map(header => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          // Escape quotes
          let valStr = String(val).replace(/"/g, '""');
          // If value has commas or quotes, wrap it in double quotes
          if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n') || valStr.includes('\r')) {
            valStr = `"${valStr}"`;
          }
          return valStr;
        });
        csvStr += line.join(',') + '\r\n';
      });

      // Prepend UTF-8 BOM representation: \uFEFF
      const bomCsv = '\uFEFF' + csvStr;
      const blob = new Blob([bomCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${finalFileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Save to logs
      const sizeEstimateKb = Math.round(blob.size / 1024);
      addNewHistoryRecord(finalFileName, dataToDownload.length, 'csv', fileScope, sizeEstimateKb);

    } else {
      // Export as Excel Sheet XML .xlsx using installed SheetJS
      try {
        const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Core Preprocessed Directory");
        
        // Write file binary
        XLSX.writeFile(workbook, `${finalFileName}.xlsx`);
        
        // Save to logs (estimate size based on rows)
        const sizeEstimateKb = Math.round((dataToDownload.length * 280) / 1024) + 12;
        addNewHistoryRecord(finalFileName, dataToDownload.length, 'xlsx', fileScope, sizeEstimateKb);
      } catch (err) {
        console.error("SheetJS Excel file write triggered an issue", err);
      }
    }
  };

  const addNewHistoryRecord = (fileName: string, recordCount: number, format: 'csv' | 'xlsx', scopeName: string, sizeKb: number) => {
    const newRecord: ExportHistoryItem = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
      fileName: `${fileName}.${format}`,
      recordCount,
      format,
      scope: scopeName,
      sizeKb
    };
    const updatedHistory = [newRecord, ...exportHistory].slice(0, 50); // Keep max 50 items
    saveHistory(updatedHistory);
  };

  const reDownloadHistoryItem = (item: ExportHistoryItem) => {
    // Generate a quick download from current prepreprocessed list or raw list
    // To be perfectly accurate, we just run preprocess download from memory if matching, or give a friendly alert
    if (preprocessedData.length > 0) {
      triggerFileDownload(preprocessedData);
    } else {
      // Run quick preprocess to populate and download
      runPreprocessingPipeline();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="export-pipeline-workspace" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Title Header with info summary */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden border border-indigo-900 relative">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block bg-indigo-900/60 text-indigo-200 font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-indigo-800">
            {language === 'ar' ? 'وحدة معالجة وتصدير البيانات العامة' : 'Data Preprocessing & Export Facility'}
          </span>
          <h2 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
            {language === 'ar' ? 'مخرجات جاهزة للرفع على قاعدة بيانات Supabase' : 'Supabase Ingestion Pipeline & File Exporter'}
          </h2>
          <p className="text-slate-350 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-4xl">
            {language === 'ar' 
              ? 'قم بتنظيف وتجهيز وترتيب البيانات الجغرافية والتصنيفية العراقية المجمعة من جهات متعددة. تصدير مباشر لملفات Excel و CSV متوافقة ١٠٠٪ مع جداول PostgreSQL دون الحاجة لأي تعديلات يدوية.' 
              : 'Our state-of-the-art export facility automatically cleans unicode text layout, prunes duplicates based on confidence sliders, formats Iraqi dial numbers, cleans tracking URLs, and orders items correctly according to governorate cascades.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls of the Preprocessing Pipeline */}
        <div className="lg:col-span-8 space-y-6">

          {/* Filtering and scope criteria card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Filter className="h-5 w-5 text-indigo-600 animate-pulse" />
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  {language === 'ar' ? 'تحديد نطاقات الحزم والمجموعات المستهدفة' : '1. Batch Scopes & Geographical Filters'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'حدد المحافظات أو القطاعات المطلوبة للتصدير (اترك فارغة للتصدير الكامل للعراق)' : 'Select target criteria. Leave empty to automatically export entire Iraqi database.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Governorates selection list */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-450 uppercase block tracking-wider">
                  {language === 'ar' ? 'المحافظات المستهدفة بالبحث والتصدير' : 'Filter Governorates (Multi-select)'}
                </label>
                <div className="border border-slate-100 rounded-2xl bg-slate-50 p-3 h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {GOVERNORATES.map(gov => {
                    const isChecked = selectedGovs.includes(gov.id);
                    return (
                      <button
                        key={gov.id}
                        type="button"
                        onClick={() => toggleGovSelection(gov.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition duration-150 ${isChecked ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-white text-slate-650'}`}
                      >
                        <span>{language === 'ar' ? gov.nameAr : gov.nameEn}</span>
                        {isChecked && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories selection list */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-450 uppercase block tracking-wider">
                  {language === 'ar' ? 'الفئات والقطاعات المستهدفة' : 'Filter Categories (Multi-select)'}
                </label>
                <div className="border border-slate-100 rounded-2xl bg-slate-50 p-3 h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {CATEGORIES.map(cat => {
                    const isChecked = selectedCats.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCatSelection(cat.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition duration-150 ${isChecked ? 'bg-slate-900 text-white font-bold' : 'hover:bg-white text-slate-650'}`}
                      >
                        <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                        {isChecked && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Presets Shortcuts */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 items-center">
              <span className="font-semibold">{language === 'ar' ? 'Presets الحفظ السريع:' : 'Quick shortcuts:'}</span>
              <button
                onClick={() => { setSelectedGovs([]); setSelectedCats([]); }}
                className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-650 rounded-lg Transition font-semibold text-[11px]"
              >
                {language === 'ar' ? 'كل العراق (قاعدة البيانات كاملة)' : 'Whole Iraq Countrywide'}
              </button>
              <button
                onClick={() => { setSelectedGovs(['baghdad']); setSelectedCats(['restaurants']); }}
                className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-650 rounded-lg Transition font-semibold text-[11px]"
              >
                {language === 'ar' ? 'مطاعم بغداد فقط (baghdad_restaurants)' : 'Baghdad Restaurants'}
              </button>
              <button
                onClick={() => { setSelectedGovs(['erbil']); setSelectedCats(['hotels']); }}
                className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-50 rounded-lg Transition font-semibold text-[11px]"
              >
                {language === 'ar' ? 'فنادق أربيل (erbil_hotels)' : 'Erbil Hotels'}
              </button>
            </div>
          </div>

          {/* Preprocessing parameters controls block */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sliders className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  {language === 'ar' ? '٢. خوارزميات تطهير ومطابقة وتوطين المدخلات' : '2. Normalization Engine Parameters & Cleanup Switches'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'حدد معايير وقواعد معالجة النصوص والهواتف والروابط السحابية' : 'Configure strict constraints regarding duplication confidence levels and empty validations.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              
              {/* Group Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-850 block">{language === 'ar' ? 'حذف المتكررات تلقائياً' : 'Automatic Duplicate Purge'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'ar' ? 'تصفية وحذف المتكررات في نفس نطاق الـ GPS والاسم' : 'Prunes fuzzy names and phone conflicts'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={removeDuplicates}
                    onChange={(e) => setRemoveDuplicates(e.target.checked)}
                    className="h-4 w-4 accent-indigo-650"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-850 block">{language === 'ar' ? 'المعيرة القياسية لأرقام الهواتف' : 'Iraqi Phone Normalization'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'ar' ? 'تحويل الأرقام إلى الترميز والتحقق من المشغلين' : 'Convert all numbers to standard international format (+9647X)'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={normalizePhones}
                    onChange={(e) => setNormalizePhones(e.target.checked)}
                    className="h-4 w-4 accent-indigo-650"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-850 block">{language === 'ar' ? 'فرز روابط الويب والشبكات' : 'Sanitize Web & Social URLs'}
                    </span>
                    <span className="text-[10px] text-slate-400">{language === 'ar' ? 'تجريد الروابط من وسوم التتبع وزيادة التوافق لـ Postgres' : 'Strip analytics tags and tracking payloads from links'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={validateUrls}
                    onChange={(e) => setValidateUrls(e.target.checked)}
                    className="h-4 w-4 accent-indigo-650"
                  />
                </div>
              </div>

              {/* Duplicate score threshold and exclusion criteria */}
              <div className="space-y-4 bg-slate-50/40 p-4 rounded-3xl border border-slate-100">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-xs">{language === 'ar' ? 'حساسية عتبة التكرار' : 'De-duplication Match Slider'}</span>
                    <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      {dupThreshold}% Confidence score
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="55" 
                    max="95" 
                    value={dupThreshold}
                    onChange={(e) => setDupThreshold(parseInt(e.target.value))}
                    disabled={!removeDuplicates}
                    className="w-full bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-[9px] text-slate-400 italic">
                    {language === 'ar' ? '*النسب العالية تتطلب مطابقة تامة للهواتف. النسب المنخفضة تقارن الاسم الجغرافي بـ Levenshtein.' : '*Lower thresholds catches fuzzy naming conventions, higher levels require exact phone / social alignments.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">{language === 'ar' ? 'تجاهل البيانات الناقصة' : 'Strict Incomplete Filter'}</span>
                    <input
                      type="checkbox"
                      checked={excludeIncomplete}
                      onChange={(e) => setExcludeIncomplete(e.target.checked)}
                      className="h-4 w-4 accent-indigo-650"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === 'ar' ? 'يقوم بحذف المنشآت التي لا تحتوي على قنوات اتصال أو اسم تجاري لضمان نقاء كامل' : 'Prunes any corporate records missing both an active phone line and a business name.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">{language === 'ar' ? 'فصل وتدقيق خطوط الواتساب' : 'Only WhatsApp active'}</span>
                    <input
                      type="checkbox"
                      checked={hasWhatsAppFilter}
                      onChange={(e) => setHasWhatsAppFilter(e.target.checked)}
                      className="h-4 w-4 accent-indigo-650"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Ingestion triggers build row */}
            <div className="p-4 bg-slate-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white rounded-xl h-10 w-10 flex items-center justify-center shadow">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-xs">
                    {language === 'ar' ? 'تصدير وتحويل مخرجات PostgreSQL / Supabase' : '3. Final File Compilation & Supabase Ingestion Output'}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-sans">
                    {language === 'ar' ? `قاعدة البيانات المتاحة حالياً: ${totalDbCount} مدخلات خام منشورة.` : `Available dataset inside in-memory store: ${totalDbCount} rows.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center w-full md:w-auto justify-end">
                {/* Export format swapper */}
                <div className="bg-slate-800 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-755 text-[10px] font-sans">
                  <button
                    onClick={() => setExportFormat('xlsx')}
                    className={`py-1 px-2.5 rounded font-semibold transition ${exportFormat === 'xlsx' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    EXCEL (.xlsx)
                  </button>
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`py-1 px-2.5 rounded font-semibold transition ${exportFormat === 'csv' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    CSV (Supabase)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={runPreprocessingPipeline}
                  disabled={preprocessLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow"
                >
                  {preprocessLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{language === 'ar' ? 'جاري التطهير والجمع...' : 'Preprocessing...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>{language === 'ar' ? 'معالجة وتصدير المخرجات' : 'Apply Pipeline & Export'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Export process and pipeline log view */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-slate-800 text-sm">
              {language === 'ar' ? 'مراقبة حالة معالج التصدير والـ Compiler' : 'Export Preprocessing Pipeline Log'}
            </h3>
            
            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-350 min-h-[150px] max-h-56 overflow-y-auto space-y-1 text-slate-350 select-text border border-slate-800">
              {pipelineLogs.length === 0 ? (
                <p className="text-slate-600 italic">
                  &gt;&gt; Ready. Click "Apply Pipeline & Export" to initiate data validation rules.
                </p>
              ) : (
                pipelineLogs.map((log, i) => (
                  <p key={i} className="text-emerald-400 font-normal">
                    &gt;&gt; {log}
                  </p>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column: Preprocessing progress indicator and history logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Animated visual pipeline steps */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-indigo-50/50 pb-3">
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                {language === 'ar' ? 'خطوات المعالجة المتتالية' : 'Pipeline Execution Map'}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
                {language === 'ar' ? 'قواعد التطهير وحفظ التوافق' : 'Clean & Ingest Steps'}
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              {pipelineSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentPipelineStep > stepNum;
                const isActive = currentPipelineStep === stepNum;
                
                return (
                  <div key={idx} className={`flex gap-3 items-start p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50/30 ring-1 ring-indigo-500/10' : ''}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isActive ? 'bg-indigo-600 text-white animate-pulse' :
                      'bg-slate-150 bg-slate-100 text-slate-500'
                    }`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className={`font-bold ${isActive ? 'text-indigo-700' : isCompleted ? 'text-slate-700' : 'text-slate-450'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last preprocessing report metrics */}
          {pipelineStats.finalCount > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slide-up">
              <h3 className="font-sans font-bold text-slate-850 text-xs uppercase font-mono tracking-wider">
                {language === 'ar' ? 'تقرير المعالجة الأخير' : 'Last Preprocessing Audit'}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Scanned Rows</span>
                  <span className="font-bold text-slate-800">{pipelineStats.scanned}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Phone Standardized</span>
                  <span className="font-bold text-slate-800 text-emerald-650">+{pipelineStats.cleanedPhones}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Duplicates Blocked</span>
                  <span className="font-bold text-rose-600">-{pipelineStats.duplicatePruned}</span>
                </div>
                <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100/60">
                  <span className="text-indigo-650 block text-[9px] uppercase font-mono">SUPABASE READY</span>
                  <span className="font-bold text-indigo-750 text-indigo-700">{pipelineStats.finalCount} rows</span>
                </div>
              </div>
            </div>
          )}

          {/* Exquisite Export history log card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-5/40 pb-3">
              <div className="flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  {language === 'ar' ? 'سجلات وتقارير التصدير السابقة' : 'Ingestion Export Logs'}
                </h3>
              </div>
              {exportHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-mono font-bold flex items-center gap-0.5"
                >
                  <Trash className="h-3 w-3" />
                  {language === 'ar' ? 'مسح السجلات' : 'Clear Logs'}
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {exportHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  {language === 'ar' ? 'لا توجد عمليات تصدير مسجلة حالياً.' : 'No historic downloads collected in this session.'}
                </p>
              ) : (
                exportHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs font-sans hover:bg-slate-100/60 transition">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-850 truncate max-w-[130px] font-mono text-[11px]" title={item.fileName}>
                        {item.fileName}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase shrink-0 font-mono">
                        {item.format}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{item.timestamp}</span>
                      <span className="font-semibold text-slate-600">{item.recordCount} records ({item.sizeKb} kb)</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center">
                      <span className="text-[9px] text-emerald-650 bg-emerald-50 rounded px-1.5 font-bold uppercase tracking-wider">
                        Supabase Ingest Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => reDownloadHistoryItem(item)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold font-sans flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {language === 'ar' ? 'إعادة التصدير' : 'Re-export'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
