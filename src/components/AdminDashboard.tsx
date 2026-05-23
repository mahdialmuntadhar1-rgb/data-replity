import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  GitMerge, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Governorate, Category, DuplicateLog, Business, PlatformStats } from '../types';
import { getGovernorateName, getCategoryName } from '../geo_and_categories';

interface AdminDashboardProps {
  categories: Category[];
  locations: Governorate[];
  language: 'en' | 'ar' | 'ku';
  translations: any;
}

export default function AdminDashboard({ 
  categories, 
  locations, 
  language, 
  translations 
}: AdminDashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateLog[]>([]);
  const [selectedDup, setSelectedDup] = useState<DuplicateLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfigMerge, setShowConfigMerge] = useState(false);

  // Business entities involved in the chosen duplicate pair
  const [bus1, setBus1] = useState<Business | null>(null);
  const [bus2, setBus2] = useState<Business | null>(null);

  // Custom merge field selectors (which value to preserve)
  const [mergedFields, setMergedFields] = useState<Partial<Business>>({});

  const isRtl = language === 'ar';

  const fetchStatsAndDuplicates = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Duplicates queue
      const dupRes = await fetch('/api/duplicates');
      const dupData = await dupRes.json();
      setDuplicates(dupData);
    } catch (e) {
      console.error("Failed fetching admin details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndDuplicates();
  }, []);

  const handleSelectDuplicate = async (dup: DuplicateLog) => {
    setSelectedDup(dup);
    setShowConfigMerge(true);

    // Fetch full business detail for both sides to build comparison matrix
    try {
      const res1 = await fetch(`/api/businesses?search=${encodeURIComponent(dup.business_name_1)}`);
      const data1 = await res1.json();
      const match1 = data1.businesses.find((b: Business) => b.id === dup.business_id_1);

      const res2 = await fetch(`/api/businesses?search=${encodeURIComponent(dup.business_name_2)}`);
      const data2 = await res2.json();
      const match2 = data2.businesses.find((b: Business) => b.id === dup.business_id_2);

      const b1Val = match1 || { id: dup.business_id_1, business_name: dup.business_name_1 };
      const b2Val = match2 || { id: dup.business_id_2, business_name: dup.business_name_2 };

      setBus1(b1Val);
      setBus2(b2Val);

      // Default merged data matches Business 1
      setMergedFields({
        business_name: b1Val.business_name,
        description: b1Val.description || b2Val.description,
        category_id: b1Val.category_id || b2Val.category_id,
        subcategory_id: b1Val.subcategory_id || b2Val.subcategory_id,
        governorate: b1Val.governorate || b2Val.governorate,
        city: b1Val.city || b2Val.city,
        district: b1Val.district || b2Val.district,
        address: b1Val.address || b2Val.address,
        phone_number: b1Val.phone_number || b2Val.phone_number,
        whatsapp_number: b1Val.whatsapp_number || b2Val.whatsapp_number || b1Val.phone_number,
        facebook_url: b1Val.facebook_url || b2Val.facebook_url,
        instagram_url: b1Val.instagram_url || b2Val.instagram_url,
        website: b1Val.website || b2Val.website,
      });

    } catch (err) {
      console.error("Failed loading businesses for side-by-side preview", err);
    }
  };

  const handleExecuteMerge = async (resolveAction: 'merge' | 'reject') => {
    if (!selectedDup) return;

    try {
      const res = await fetch('/api/duplicates/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_1: selectedDup.business_id_1,
          id_2: selectedDup.business_id_2,
          action: resolveAction,
          keepId: selectedDup.business_id_1, // Default keeps 1, archives 2
          mergedData: resolvedMergedPayload()
        })
      });

      if (res.ok) {
        setSelectedDup(null);
        setBus1(null);
        setBus2(null);
        setShowConfigMerge(false);
        // Refresh
        fetchStatsAndDuplicates();
      }
    } catch (err) {
      console.error("Failed resolving duplicate", err);
    }
  };

  const resolvedMergedPayload = () => {
    if (!bus1 || !bus2) return {};
    // Mix and match values as configured in selections
    return {
      ...mergedFields,
    };
  };

  const selectFieldOption = (fieldName: keyof Business, value: any) => {
    setMergedFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-analytics-view" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total index */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans text-xs uppercase font-medium tracking-wider">
              {translations.statsTotal || 'Total Registry'}
            </span>
            <div className="bg-indigo-50 text-indigo-600 h-9 w-9 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-sans font-bold text-slate-800 mt-2">
            {stats?.totalBusinesses || 0}
          </p>
          <p className="text-xs font-sans text-slate-500 mt-1">
            {language === 'ar' ? 'شركات ومنشآت نشطة عامة' : 'Active public entities'}
          </p>
        </div>

        {/* Verified matched */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans text-xs uppercase font-medium tracking-wider">
              {translations.statsVerified || 'Verified Master List'}
            </span>
            <div className="bg-teal-50 text-teal-600 h-9 w-9 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-sans font-bold text-slate-800 mt-2">
            {stats?.verifiedCount || 0}
          </p>
          <p className="text-xs font-sans text-slate-500 mt-1 mr-2">
            {stats?.totalBusinesses ? Math.round(((stats.verifiedCount) / stats.totalBusinesses) * 100) : 0}% {language === 'ar' ? 'نسبة التدقيق المطابق' : 'compliance rate'}
          </p>
        </div>

        {/* Pending verification */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans text-xs uppercase font-medium tracking-wider">
              {translations.statsPending || 'Awaiting Peer Review'}
            </span>
            <div className="bg-amber-50 text-amber-600 h-9 w-9 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-sans font-bold text-slate-800 mt-2">
            {stats?.pendingValidationCount || 0}
          </p>
          <p className="text-xs font-sans text-slate-500 mt-1">
            {language === 'ar' ? 'تحتاج إلى تدقيق وحفظ' : 'Need administrative validation'}
          </p>
        </div>

        {/* Duplicate conflicts */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans text-xs uppercase font-medium tracking-wider">
              {translations.duplicateCount || 'Duplicate System Alerts'}
            </span>
            <div className="bg-rose-50 text-rose-600 h-9 w-9 rounded-xl flex items-center justify-center">
              <GitMerge className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-sans font-bold text-slate-800 mt-2">
            {duplicates.length || 0}
          </p>
          <p className="text-xs font-sans text-rose-500 font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-pulse" />
            {duplicates.length > 0 
              ? (language === 'ar' ? 'تتطلب دمج يدوي فوري' : 'Requires manual merging workbench') 
              : (language === 'ar' ? 'البيانات نظيفة ومثالية' : 'Database fully clean')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span: Duplicate Resolution Workbench Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-lg flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-indigo-500" />
                  {translations.duplicateWorkbench || 'Deduplication & Smart Merging Workbench'}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  {language === 'ar' 
                    ? 'يقوم النظام بحساب الثقة لمطابقة الهواتف والروابط والتشابه اللفظي (خوارزمية ليفينشتاين ومطابقة الـ GPS).' 
                    : 'Levenshtein word distances, normalized phone matches, and GPS proximities compare candidates continuously.'}
                </p>
              </div>
              <button 
                onClick={fetchStatsAndDuplicates}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                title="Refresh index scans"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* List Awaiting Duplicates */}
            <div className="mt-6 space-y-4">
              {duplicates.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="bg-teal-50 text-teal-600 h-10 w-10 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-5 w-5" />
                  </div>
                  <h4 className="font-sans font-bold text-slate-700">
                    {language === 'ar' ? 'فحص تام: خالي من التكرار' : 'Registry Fully Deduplicated!'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                    {language === 'ar' 
                      ? 'لا توجد شركات تمتلك نفس المعرف الهاتفي أو تطابق وثيق في نفس منطقة الـ GPS حالياً.'
                      : 'All records maintain discrete phone configurations and separate geographical marks.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {duplicates.map((dup) => {
                    const isSelected = selectedDup?.id === dup.id;
                    const confidenceColor = 
                      dup.confidence_score >= 90 ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      dup.confidence_score >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-200';

                    return (
                      <div 
                        key={dup.id}
                        onClick={() => handleSelectDuplicate(dup)}
                        className={`p-4 rounded-2xl border transition duration-150 cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
                                {dup.confidence_score}% {translations.confidenceScore || 'Similarity Match'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {dup.matching_markers.map(m => `• ${m}`).join(' ')}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-sans font-semibold text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="bg-slate-100 h-4 w-4 rounded text-[10px] flex items-center justify-center text-slate-400 font-mono">1</span>
                                <span className="truncate">{dup.business_name_1}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="bg-slate-100 h-4 w-4 rounded text-[10px] flex items-center justify-center text-slate-400 font-mono">2</span>
                                <span className="truncate">{dup.business_name_2}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end self-end sm:self-center">
                            <span className="text-[11px] font-semibold text-indigo-600 font-sans flex items-center gap-1 bg-indigo-50 py-1 px-2.5 rounded-lg border border-indigo-100">
                              {language === 'ar' ? 'مراجعة ودمج' : 'Analyze & Merge'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Merge Workbench Detail Form */}
          {showConfigMerge && bus1 && bus2 && selectedDup && (
            <div className="bg-white border-2 border-slate-700/10 rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-sans font-bold text-slate-800 text-base">
                    {language === 'ar' ? "لوحة التوفيق والدمج الميداني" : "Field-Level Comparison Matrix"}
                  </h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {language === 'ar' 
                      ? "حدد القيمة النهائية التي تريد تضمينها في الملف الرئيسي الموحد لكل حقل من الحقول المتاحة."
                      : "Choose which value should prevail for each field to complete the master deduplicated entity."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowConfigMerge(false)}
                  className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>

              {/* Matrix Layout */}
              <div className="space-y-4">
                
                {/* Headers */}
                <div className="grid grid-cols-3 gap-4 text-xs font-mono uppercase text-slate-400 pb-1 border-b border-slate-100">
                  <span>{language === 'ar' ? 'الحقل' : 'Field'}</span>
                  <span>{language === 'ar' ? 'المنشأة الأولى (رئيسي)' : 'Business 1'}</span>
                  <span>{language === 'ar' ? 'المنشأة الثانية (مكررة)' : 'Business 2'}</span>
                </div>

                {/* Field Business Name */}
                <div className="grid grid-cols-3 gap-4 text-sm font-sans items-center py-1">
                  <span className="font-semibold text-slate-500 text-xs">{language === 'ar' ? 'الاسم التجاري' : 'Business Name'}</span>
                  <button 
                    onClick={() => selectFieldOption('business_name', bus1.business_name)}
                    className={`p-2.5 rounded-xl border text-left ${mergedFields.business_name === bus1.business_name ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus1.business_name}
                  </button>
                  <button 
                    onClick={() => selectFieldOption('business_name', bus2.business_name)}
                    className={`p-2.5 rounded-xl border text-left ${mergedFields.business_name === bus2.business_name ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus2.business_name}
                  </button>
                </div>

                {/* Field Phone */}
                <div className="grid grid-cols-3 gap-4 text-sm font-sans items-center py-1">
                  <span className="font-semibold text-slate-500 text-xs">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                  <button 
                    onClick={() => selectFieldOption('phone_number', bus1.phone_number)}
                    className={`p-2.5 rounded-xl border text-left truncate ${mergedFields.phone_number === bus1.phone_number ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus1.phone_number || '(empty)'}
                  </button>
                  <button 
                    onClick={() => selectFieldOption('phone_number', bus2.phone_number)}
                    className={`p-2.5 rounded-xl border text-left truncate ${mergedFields.phone_number === bus2.phone_number ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus2.phone_number || '(empty)'}
                  </button>
                </div>

                {/* Field WhatsApp */}
                <div className="grid grid-cols-3 gap-4 text-sm font-sans items-center py-1">
                  <span className="font-semibold text-slate-500 text-xs">{language === 'ar' ? 'رقم الواتساب' : 'WhatsApp'}</span>
                  <button 
                    onClick={() => selectFieldOption('whatsapp_number', bus1.whatsapp_number)}
                    className={`p-2.5 rounded-xl border text-left truncate ${mergedFields.whatsapp_number === bus1.whatsapp_number ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus1.whatsapp_number || bus1.phone_number || '(empty)'}
                  </button>
                  <button 
                    onClick={() => selectFieldOption('whatsapp_number', bus2.whatsapp_number)}
                    className={`p-2.5 rounded-xl border text-left truncate ${mergedFields.whatsapp_number === bus2.whatsapp_number ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus2.whatsapp_number || bus2.phone_number || '(empty)'}
                  </button>
                </div>

                {/* Field Address */}
                <div className="grid grid-cols-3 gap-4 text-sm font-sans items-center py-1">
                  <span className="font-semibold text-slate-500 text-xs">{language === 'ar' ? 'العنوان' : 'Address / District'}</span>
                  <button 
                    onClick={() => selectFieldOption('address', bus1.address)}
                    className={`p-2.5 rounded-xl border text-left truncate text-xs ${mergedFields.address === bus1.address ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus1.address} {bus1.district ? `(${bus1.district})` : ''}
                  </button>
                  <button 
                    onClick={() => selectFieldOption('address', bus2.address)}
                    className={`p-2.5 rounded-xl border text-left truncate text-xs ${mergedFields.address === bus2.address ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus2.address} {bus2.district ? `(${bus2.district})` : ''}
                  </button>
                </div>

                {/* Field Facebook */}
                <div className="grid grid-cols-3 gap-4 text-sm font-sans items-center py-1">
                  <span className="font-semibold text-slate-500 text-xs">{language === 'ar' ? 'فيسبوك' : 'Facebook Page'}</span>
                  <button 
                    onClick={() => selectFieldOption('facebook_url', bus1.facebook_url)}
                    className={`p-2.5 rounded-xl border text-left truncate text-xs ${mergedFields.facebook_url === bus1.facebook_url ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus1.facebook_url || '(empty)'}
                  </button>
                  <button 
                    onClick={() => selectFieldOption('facebook_url', bus2.facebook_url)}
                    className={`p-2.5 rounded-xl border text-left truncate text-xs ${mergedFields.facebook_url === bus2.facebook_url ? 'border-slate-800 bg-slate-900 text-white font-medium' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {bus2.facebook_url || '(empty)'}
                  </button>
                </div>
              </div>

              {/* Action Merg buttons tool (ST_12) */}
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {language === 'ar' 
                      ? "الدخول في الدمج سيقوم بترقية المنشأة الأولى بالبيانات المختارة وتعليم المنشأة الثانية كأرشيف تكراري."
                      : "Executing 'Merge Match' updates Business 1 with your chosen fields, flag Business 2 as duplicate."}
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleExecuteMerge('reject')}
                    className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-semibold font-sans"
                  >
                    {language === 'ar' ? 'فصل كجهتين منفصلتين' : 'Mark as Discrete Units'}
                  </button>
                  <button
                    onClick={() => handleExecuteMerge('merge')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    {language === 'ar' ? 'اعتماد وحفظ الدمج الموحد' : 'Confirm Master Merge'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Span: Demographic Telemetries & Geo Lists */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Geographical telemetry lists */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                {language === 'ar' ? 'توزع المنشآت حسب المحافظة' : 'Businesses by Governorate'}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans uppercase font-medium tracking-wide">
                {language === 'ar' ? 'احصائيات جغرافية حية' : 'Live geographic analysis'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {locations.map(gov => {
                const count = stats?.businessesByGovernorate[gov.id] || 0;
                const maxVal = Math.max(...(Object.values(stats?.businessesByGovernorate || {}) as number[]), 1);
                const normalizedPercent = maxVal > 0 ? (count / maxVal) * 100 : 0;

                return (
                  <div key={gov.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-semibold text-slate-700">
                        {language === 'ar' ? gov.nameAr : gov.nameEn}
                      </span>
                      <span className="text-slate-500 font-semibold">{count}</span>
                    </div>
                    {/* Progress bars */}
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${normalizedPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category distribution */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                {language === 'ar' ? 'توزع المنشآت حسب القطاع' : 'Registry by Core Category'}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans uppercase font-medium tracking-wide">
                {language === 'ar' ? 'تصنيف القطاعات' : 'Operational breakdown'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {categories.slice(0, 10).map(cat => {
                const count = stats?.businessesByCategory[cat.id] || 0;
                const total = stats?.totalBusinesses || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-medium text-slate-600">
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">{pct}% ({count})</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-800 rounded-full" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
