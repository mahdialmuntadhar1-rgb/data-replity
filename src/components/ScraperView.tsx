import { useState } from 'react';
import { 
  Globe, 
  Terminal, 
  Play, 
  Trash2, 
  FileText, 
  HelpCircle,
  Cpu,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy
} from 'lucide-react';
import { Governorate, Category } from '../types';

interface ScraperViewProps {
  categories: Category[];
  locations: Governorate[];
  language: 'en' | 'ar' | 'ku';
  translations: any;
  onRefreshDirectory: () => void;
}

export default function ScraperView({ 
  categories, 
  locations, 
  language, 
  translations,
  onRefreshDirectory
}: ScraperViewProps) {
  const [platform, setPlatform] = useState<'google_maps' | 'facebook' | 'instagram' | 'yellowpages' | 'custom_upload'>('facebook');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [scrapedResult, setScrapedResult] = useState<any | null>(null);
  const [autoMergedFlag, setAutoMergedFlag] = useState(false);
  const [mergedTargetId, setMergedTargetId] = useState('');

  const isRtl = language === 'ar';

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

  const handlePasteSample = (type: 'facebook' | 'google_maps') => {
    setUrl(type === 'facebook' ? 'https://facebook.com/iraq.elite.dental' : 'https://maps.google.com/?cid=129482');
    setRawText(defaultSamples[type]);
    setPlatform(type);
  };

  const handleRunScrape = async () => {
    if (!url && !rawText) return;
    setLoading(true);
    setTerminalLogs(["Connecting to platform target host..."]);
    setScrapedResult(null);
    setAutoMergedFlag(false);
    setMergedTargetId('');

    try {
      // Direct call to our backend crawling pipeline
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
        // Render logs with intervals to simulate processing
        let currentLogs: string[] = [];
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, i === 0 ? 100 : 300));
          currentLogs = [...currentLogs, data.logs[i]];
          setTerminalLogs(currentLogs);
        }

        setScrapedResult(data.business);
        setAutoMergedFlag(data.autoMerged);
        setMergedTargetId(data.mergeTargetId);
        onRefreshDirectory(); // Keep parent directory up-to-date
      } else {
        setTerminalLogs(prev => [...prev, `Error: ${data.error || 'Pipeline parsing failed'}`]);
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `Fatal error matching proxy socket: ${(err as any).message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="crawler-importer-workspace" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-5 flex gap-4 items-start shadow-sm">
        <HelpCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <h4 className="font-bold text-sm">
            {language === 'ar' ? 'أخلاقيات وامتثال جمع البيانات العامة' : 'Respectful & Compliant Data Harvesting'}
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            {language === 'ar' 
              ? 'تلتزم هذه المنصة بالامتثال لملفات robots.txt ومحددات الاستخدام العادل لمواقع التواصل الاجتماعي والخرائط والمواقع العامة الأخرى في العراق. لا تحاول جمع أرقام هواتف غامضة أو تفاصيل سرية.' 
              : 'Our crawling pipeline validates robots.txt parameters, handles rate-limits, and structures public-facing profile cards from Google Maps or social profiles with full integrity.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Crawler configuration */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-500" />
              {language === 'ar' ? 'تهيئة زاحف الاستخلاص الذكي' : 'Data Harvesting Controls'}
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {language === 'ar' ? 'اختر منصة المصدر للتحقق من البروتوكولات والخصائص.' : 'Configure the platform parser and seed your paste parameters below.'}
            </p>
          </div>

          {/* Preset Samples Triggers */}
          <div className="space-y-2">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider block">
              {language === 'ar' ? 'عينات اختبار سريعة لتسريع التجربة' : 'One-Click Seed Testers'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <button
                onClick={() => handlePasteSample('facebook')}
                className="py-2.5 px-3 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-700 transition font-medium flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                {language === 'ar' ? 'عيّنة ملف فيسبوك' : 'Seed Facebook Post'}
              </button>
              <button
                onClick={() => handlePasteSample('google_maps')}
                className="py-2.5 px-3 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 transition font-medium flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                {language === 'ar' ? 'عيّنة خرائط جوجل' : 'Seed Maps Profile'}
              </button>
            </div>
          </div>

          {/* Crawler Platform Select */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {language === 'ar' ? 'منصة استخلاص المصدر' : 'Platform Source Profile'}
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none"
            >
              <option value="google_maps">Google Maps public business page</option>
              <option value="facebook">Facebook business page / profile text</option>
              <option value="instagram">Instagram business profile info</option>
              <option value="yellowpages">Iraqi Local Yellow Pages</option>
              <option value="custom_upload">Plain unstructured text block paste</option>
            </select>
          </div>

          {/* Input URL */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {language === 'ar' ? 'عنوان الرابط العام (URL)' : 'Target Public URL Link'}
            </label>
            <input
              type="text"
              placeholder="e.g. https://facebook.com/iraq.clinic"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none"
            />
          </div>

          {/* Paste Clipboard Box */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
                {language === 'ar' ? 'تفاصيل النص المنسوخ بالكامل' : 'Raw Text Paste Context'}
              </label>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold">
                {language === 'ar' ? 'استخراج ذكي بالـ AI' : 'Gemini Auto-Parse'}
              </span>
            </div>
            <textarea
              rows={6}
              placeholder={language === 'ar' ? "الصق هنا تفاصيل الاتصال، الهاتف، المحافظة، العنوان..." : "Paste raw business details containing names, Iraqi phones (0770/0780), emails, or addresses..."}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 font-sans text-sm rounded-2xl py-2.5 px-3 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none"
            />
          </div>

          <button
            onClick={handleRunScrape}
            disabled={loading || (!url && !rawText)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-sans text-sm font-bold rounded-2xl transition duration-150 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {language === 'ar' ? 'جاري التحليل واستخلاص البيانات...' : 'Analyzing Unstructured Text...'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {language === 'ar' ? 'تشغيل وحدة التطهير والجمع' : 'Import & Clean Business'}
              </>
            )}
          </button>
        </div>

        {/* Right Side: Monospace terminal outputs & card previews */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active pipeline Terminal */}
          <div className="bg-slate-950 text-slate-300 rounded-3xl p-5 shadow-inner border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="h-4 w-4 text-emerald-500" />
                PLATFORM TERMINAL LOGS
              </span>
              <span>UTC STATUS: ACTIVE</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto min-h-[140px] pr-2">
              {terminalLogs.length === 0 ? (
                <p className="text-slate-600 italic">
                  &gt;&gt; Waiting for ingestion trigger details. Seed sample to start.
                </p>
              ) : (
                terminalLogs.map((log, idx) => (
                  <p key={idx} className={log.includes('🚨') ? 'text-rose-400 font-semibold' : log.includes('⚠️') ? 'text-amber-400' : 'text-slate-300'}>
                    &gt;&gt; {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Extracted Card result with AutoMerge alerts (ST_8 & ST_15) */}
          {scrapedResult && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h4 className="font-sans font-bold text-slate-800 text-sm">
                  {language === 'ar' ? 'البيانات النهائية بعد مطابقتها وتوثيقها' : 'Structured Extract Result Card'}
                </h4>
                
                {autoMergedFlag ? (
                  <span className="bg-rose-50 border border-rose-100 text-rose-750 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'تم الدمج تلقائياً (تكرار)' : 'Auto-Merged (Duplicate)'}
                  </span>
                ) : (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'سجل تصفح جديد ومؤهل' : 'Committed Awaiting Audit'}
                  </span>
                )}
              </div>

              {/* Field Previews */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Business Name</span>
                  <p className="font-semibold text-slate-800 text-sm">{scrapedResult.business_name}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Raw Phone / Captured</span>
                  <p className="font-semibold text-slate-700">{scrapedResult.phone_number || 'N/A'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Normalized Output</span>
                  <p className="font-semibold text-indigo-600 font-mono">{scrapedResult.normalized_phone || 'N/A'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Governorate</span>
                  <p className="font-semibold text-slate-700 capitalize">{scrapedResult.governorate}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">City</span>
                  <p className="font-semibold text-slate-700 capitalize">{scrapedResult.city}</p>
                </div>

                {scrapedResult.facebook_url && (
                  <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase font-mono text-[9px] block">Sanitized Facebook Link</span>
                    <p className="font-mono text-slate-600 break-all">{scrapedResult.facebook_url}</p>
                  </div>
                )}
              </div>

              {autoMergedFlag && (
                <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-2 text-xs font-sans text-rose-900 leading-relaxed">
                  <Sparkles className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <p>
                    {language === 'ar' 
                      ? `تم تجنب إضافة منشأة مكررة للشبكة بنسبة مطابقة 90%+. القيمة مرقمة الآن وتحتفظ بمرجع المعرف الرئيسي: ${mergedTargetId}.` 
                      : `A duplicate prevention trigger caught this submission. To avoid polluting the database, records were auto-merged under target: ${mergedTargetId}.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
