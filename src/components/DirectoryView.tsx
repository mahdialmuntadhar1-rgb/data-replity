import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  Phone, 
  MessageSquare, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, Category, Governorate } from '../types';
import { 
  getGovernorateName, 
  getCityName, 
  getCategoryName, 
  getSubcategoryName 
} from '../geo_and_categories';

interface DirectoryViewProps {
  categories: Category[];
  locations: Governorate[];
  language: 'en' | 'ar' | 'ku';
  translations: any;
  onEditBusiness: (b: Business) => void;
}

export default function DirectoryView({ 
  categories, 
  locations, 
  language, 
  translations,
  onEditBusiness
}: DirectoryViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Dynamic filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  // Get cities of chosen governorate
  const activeGovData = locations.find(g => g.id === selectedGov);
  const availableCities = activeGovData ? activeGovData.cities : [];

  // Get subcategories of chosen category
  const activeCatData = categories.find(c => c.id === selectedCat);
  const availableSubs = activeCatData ? activeCatData.subcategories : [];

  // Fetch businesses
  const fetchBusinesses = async (pageToFetch: number, append: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: '6',
        search: searchTerm,
        governorate: selectedGov,
        city: selectedCity,
        category_id: selectedCat,
        subcategory_id: selectedSub,
        verification_status: verificationFilter
      });

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      
      if (append) {
        setBusinesses(prev => {
          // Prevent duplicates in state
          const existingIds = new Set(prev.map(b => b.id));
          const filteredNew = data.businesses.filter((b: Business) => !existingIds.has(b.id));
          return [...prev, ...filteredNew];
        });
      } else {
        setBusinesses(data.businesses);
      }
      
      setTotalCount(data.totalCount);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error('Error fetching businesses', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger reload when filter changes
  useEffect(() => {
    fetchBusinesses(1, false);
  }, [selectedGov, selectedCity, selectedCat, selectedSub, verificationFilter, searchTerm]);

  // Handle geographic cascades
  const handleGovChange = (govId: string) => {
    setSelectedGov(govId);
    setSelectedCity('');
  };

  const handleCatChange = (catId: string) => {
    setSelectedCat(catId);
    setSelectedSub('');
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBusinesses(currentPage + 1, true);
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="space-y-8" id="business-directory-view" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 h-40 w-40 bg-zinc-700/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 h-56 w-56 bg-zinc-700/10 rounded-full blur-3xl transform -translate-x-10 translate-y-20"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-block bg-slate-800 text-slate-300 font-mono text-xs px-3.5 py-1.5 rounded-full border border-slate-700">
            {translations.statsTotal}: {totalCount} {translations.businesses}
          </span>
          <h2 className="text-3xl md:text-4xl font-sans font-bold tracking-tight">
            {language === 'ar' ? 'استكشف الشركات والخدمات في العراق' : 'Explore Iraqi Businesses & Services'}
          </h2>
          <p className="text-slate-300 font-sans text-sm md:text-base leading-relaxed">
            {language === 'ar' 
              ? 'تصفح قاعدة بيانات موثقة ومطهرة وخالية من التكرار لمختلف الأقسام والمحافظات العراقية الـ 18.' 
              : 'Browse a synchronized, normalized, and duplicate-free registry covering all 18 Iraqi governorates.'}
          </p>

          {/* Search Inputs */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className={`absolute top-3.5 ${isRtl ? 'right-4' : 'left-4'} h-5 w-5 text-slate-400`} />
              <input
                type="text"
                placeholder={translations.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-slate-950/80 text-white placeholder-slate-400 font-sans rounded-2xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm focus:ring-1 focus:ring-slate-500 border border-slate-700 focus:outline-none focus:border-slate-500`}
              />
            </div>
            
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedGov('');
                setSelectedCity('');
                setSelectedCat('');
                setSelectedSub('');
                setVerificationFilter('');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700/80 text-white font-sans text-sm rounded-2xl font-medium transition duration-200 border border-slate-700"
            >
              {translations.clearFilters}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Filters Panel & List Result */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-sans font-bold text-slate-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              {translations.filters}
            </h3>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          </div>

          {/* Governorate Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {translations.governorate}
            </label>
            <select
              value={selectedGov}
              onChange={(e) => handleGovChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">{translations.allGovernorates}</option>
              {locations.map(g => (
                <option key={g.id} value={g.id}>
                  {language === 'ar' ? g.nameAr : g.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown - cascades on governorate select */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {translations.city}
            </label>
            <select
              value={selectedCity}
              disabled={!selectedGov}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full text-slate-700 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 ${!selectedGov ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'}`}
            >
              <option value="">{translations.allCities}</option>
              {availableCities.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {translations.category}
            </label>
            <select
              value={selectedCat}
              onChange={(e) => handleCatChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">{translations.allCategories}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown - cascades on category select */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {translations.subcategory}
            </label>
            <select
              value={selectedSub}
              disabled={!selectedCat}
              onChange={(e) => setSelectedSub(e.target.value)}
              className={`w-full text-slate-700 font-sans text-sm rounded-xl py-2.5 px-3 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 ${!selectedCat ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'}`}
            >
              <option value="">{translations.allSubcategories || 'All Subcategories'}</option>
              {availableSubs.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'ar' ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Badging filters */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest block">
              {translations.verificationStatus || 'Verification Status'}
            </label>
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { value: '', label: language === 'ar' ? 'الكل' : 'All States' },
                { value: 'verified', label: language === 'ar' ? 'موثق بمطابقة تامة' : 'Verified Entries Only' },
                { value: 'pending', label: language === 'ar' ? 'قيد المراجعة والتحقق' : 'Awaiting Peer Review' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVerificationFilter(opt.value)}
                  className={`text-left ${isRtl ? 'text-right' : 'text-left'} text-sm py-1.5 px-3 rounded-lg transition font-sans ${verificationFilter === opt.value ? 'bg-slate-900 text-white font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Grid Result Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 py-2.5 px-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-mono text-slate-500">
              {translations.showingResults}: <span className="text-slate-800 font-bold">{businesses.length}</span> of <span className="text-slate-800 font-bold">{totalCount}</span>
            </p>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <div className="bg-slate-50 h-14 w-14 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="font-sans font-bold text-slate-800 text-lg">
                {language === 'ar' ? 'عذراً، لم نجد نتائج مطابقة' : 'No Businesses Match Filters'}
              </h4>
              <p className="text-slate-500 font-sans max-w-md mx-auto text-sm leading-relaxed">
                {language === 'ar' 
                  ? 'يرجى مراجعة التهجئة أو ضبط فلاتر البحث والمواقع لإيجاد المنشآت الطبية أو التجارية المطلوبة.'
                  : 'Try typing a simpler term, selecting other regions, or checking alternative categories.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence mode="popLayout">
                {businesses.map((bus) => {
                  const hasPhone = bus.phone_number;
                  const hasWa = bus.whatsapp_number || bus.normalized_whatsapp;
                  const cleanWaUrl = bus.normalized_whatsapp 
                    ? `https://wa.me/${bus.normalized_whatsapp.replace('+', '')}` 
                    : `https://wa.me/${(bus.whatsapp_number || '').replace(/[^\d]/g, '')}`;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={bus.id}
                      className="bg-white hover:shadow-md transition duration-200 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Tags Header */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border border-slate-100">
                            {getCategoryName(bus.category_id, language)} {bus.subcategory_id ? `• ${getSubcategoryName(bus.category_id, bus.subcategory_id, language)}` : ''}
                          </span>
                          
                          {bus.verification_status === 'verified' ? (
                            <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
                              <CheckCircle2 className="h-3 w-3" />
                              {language === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
                              <AlertTriangle className="h-3 w-3" />
                              {language === 'ar' ? 'طلب مراجعة' : 'Pending'}
                            </span>
                          )}
                        </div>

                        {/* Title and description */}
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-slate-800 text-base hover:text-indigo-600 transition">
                            {bus.business_name}
                          </h4>
                          {bus.description && (
                            <p className="text-slate-500 font-sans text-xs line-clamp-2 leading-relaxed">
                              {bus.description}
                            </p>
                          )}
                        </div>

                        {/* Geographic location and precise address */}
                        <div className="space-y-1.5 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-sans font-medium text-slate-700">
                              {getGovernorateName(bus.governorate, language)} - {getCityName(bus.governorate, bus.city, language)}
                            </span>
                          </div>
                          {bus.address && (
                            <p className="font-sans text-[11px] text-slate-400 leading-snug pl-5 rtl:pr-5 rtl:pl-0">
                              {bus.address} {bus.district ? `(${bus.district})` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact Actions Footer */}
                      <div className="border-t border-slate-50 mt-4 pt-4 flex flex-wrap gap-2">
                        {/* Call action */}
                        {hasPhone ? (
                          <a
                            href={`tel:${bus.normalized_phone || bus.phone_number}`}
                            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 font-sans text-xs font-semibold rounded-xl border border-slate-100 transition duration-150"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {bus.phone_number}
                          </a>
                        ) : (
                          <span className="flex-1 min-w-[100px] text-center text-[10px] text-slate-300 py-2 select-none border border-slate-50/50 rounded-xl">
                            {translations.noContact || 'No Phone'}
                          </span>
                        )}

                        {/* WhatsApp Click-to-Chat trigger */}
                        {hasWa ? (
                          <a
                            href={cleanWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 hover:text-teal-900 font-sans text-xs font-bold rounded-xl border border-teal-100 transition duration-150"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                            {translations.whatsapp || 'WhatsApp'}
                          </a>
                        ) : hasPhone && bus.normalized_phone?.startsWith('+9647') ? (
                          // Iraqi mobile default prompt WhatsApp
                          <a
                            href={`https://wa.me/${bus.normalized_phone.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-500 font-sans text-xs rounded-xl transition duration-150"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {translations.whatsapp || 'WhatsApp'}
                          </a>
                        ) : null}

                        {/* Social Profile Accessors */}
                        <div className="flex gap-1.5 items-center w-full justify-end pt-1">
                          {bus.facebook_url && (
                            <a 
                              href={bus.facebook_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="h-7 w-7 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                              title="Facebook"
                            >
                              <span className="font-bold text-xs">f</span>
                            </a>
                          )}
                          {bus.instagram_url && (
                            <a 
                              href={bus.instagram_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="h-7 w-7 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                              title="Instagram"
                            >
                              <span className="font-bold text-[10px]">IG</span>
                            </a>
                          )}
                          {bus.website && (
                            <a 
                              href={bus.website} 
                              target="_blank" 
                              rel="noreferrer"
                              className="h-7 w-7 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                              title="Website"
                            >
                              <Globe className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditBusiness(bus)}
                            className="text-[10px] text-slate-400 font-sans hover:text-slate-800 px-1 py-0.5 ml-auto mr-0 rtl:mr-auto rtl:ml-0"
                          >
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-sans text-sm font-semibold rounded-2xl transition duration-150 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {translations.loading}...
                  </>
                ) : (
                  <>
                    {translations.loadMore || 'Load More'}
                    <ChevronRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
