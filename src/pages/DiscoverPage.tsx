import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { getLocalizedText } from "@/i18n/localize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Trophy,
  Palette,
  UtensilsCrossed,
  Users,
  PartyPopper,
  Briefcase,
  Moon,
  Laugh,
  GraduationCap,
  type LucideIcon
} from "lucide-react";
import { type EventFilters } from "@/types/domain";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { filterEvents, fetchCategories, fetchCities } from "@/services/eventsService";

const iconMap: Record<string, LucideIcon> = {
  Music, Trophy, Palette, UtensilsCrossed, Users, PartyPopper, Briefcase, Moon, Laugh, GraduationCap,
};

const getMinPrice = (tiers: { price: number }[]) => {
  return tiers.length ? Math.min(...tiers.map((tier) => tier.price)) : 0;
};

const ITEMS_PER_PAGE = 6;

type SortOption = "soonest" | "popularity" | "price_asc" | "price_desc";

export default function DiscoverPage() {
  const { language, t, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "soonest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Build filters object
  const filters: EventFilters = useMemo(() => ({
    category: category || undefined,
    city: city || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
    priceMax: priceRange[1] < 500 ? priceRange[1] : undefined,
    search: search || undefined,
  }), [category, city, dateFrom, dateTo, priceRange, search]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", language],
    queryFn: () => fetchCategories(language),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities", language],
    queryFn: () => fetchCities(language),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", language, filters],
    queryFn: () => filterEvents(filters, language),
  });

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const sorted = [...events];
    
    // Apply sorting
    switch (sortBy) {
      case "soonest":
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "popularity":
        sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "price_asc":
        sorted.sort((a, b) => getMinPrice(a.ticketTiers) - getMinPrice(b.ticketTiers));
        break;
      case "price_desc":
        sorted.sort((a, b) => getMinPrice(b.ticketTiers) - getMinPrice(a.ticketTiers));
        break;
    }
    
    return sorted;
  }, [events, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
    setDateFrom("");
    setDateTo("");
    setPriceRange([0, 500]);
    setSortBy("soonest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || category || city || dateFrom || dateTo || priceRange[0] > 0 || priceRange[1] < 500;

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>{t.common.search}</Label>
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
          <Input
            placeholder={t.home.searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t.discover.category}</Label>
        <Select 
          value={category} 
          onValueChange={(val) => { setCategory(val === "all" ? "" : val); handleFilterChange(); }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.discover.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.discover.allCategories}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {getLocalizedText(cat.name, language, cat.slug)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>{t.discover.city}</Label>
        <Select 
          value={city} 
          onValueChange={(val) => { setCity(val === "all" ? "" : val); handleFilterChange(); }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.discover.allCities} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.discover.allCities}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {getLocalizedText(c.name, language, c.slug)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label>{t.discover.dateRange}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
            className="text-sm"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
            className="text-sm"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>{t.discover.priceRange}</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(val) => { setPriceRange(val as [number, number]); handleFilterChange(); }}
            min={0}
            max={500}
            step={10}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{priceRange[0]} {t.common.currency}</span>
          <span>{priceRange[1]} {t.common.currency}</span>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={clearFilters}
        >
          <X className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.discover.clearFilters}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{t.discover.title} | {t.appName}</title>
        <meta 
          name="description" 
          content={t.discover.metaDescription}
        />
        <link rel="canonical" href={`https://palticket.com/${language}/discover`} />
        <link rel="alternate" hrefLang="en" href="https://palticket.com/en/discover" />
        <link rel="alternate" hrefLang="ar" href="https://palticket.com/ar/discover" />
        <meta property="og:title" content={`${t.discover.title} | ${t.appName}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://palticket.com/${language}/discover`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.discover.title}
              </h1>
              <p className="text-primary-foreground/80">
                {t.home.heroSubtitle}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    {t.discover.filters}
                  </h2>
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Mobile Filter Button + Sort */}
              <div className="flex items-center gap-3 mb-6">
                {/* Mobile Filters */}
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t.discover.filters}
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ltr:ml-2 rtl:mr-2 h-5 w-5 p-0 flex items-center justify-center">
                          !
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={isRTL ? "right" : "left"} className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        {t.discover.filters}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <div className="flex-1 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {t.discover.showing} <span className="font-medium text-foreground">{filteredEvents.length}</span> {t.discover.events}
                  </p>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soonest">{t.discover.sortOptions.date}</SelectItem>
                      <SelectItem value="popularity">{t.discover.sortOptions.popularity}</SelectItem>
                      <SelectItem value="price_asc">{t.discover.sortOptions.priceAsc}</SelectItem>
                      <SelectItem value="price_desc">{t.discover.sortOptions.priceDesc}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Events Grid */}
              <AnimatePresence mode="wait">
                {paginatedEvents.length > 0 ? (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {paginatedEvents.map((event, index) => {
                      const categoryData = categories.find(c => c.slug === event.category);
                      const IconComponent = categoryData ? iconMap[categoryData.icon] : Music;
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Link to={`/${language}/events/${event.slug}`}>
                            <Card variant="interactive" className="overflow-hidden h-full">
                              <div className="aspect-[16/10] overflow-hidden relative">
                                <img
                                  src={event.images[0]}
                                  alt={getLocalizedText(event.title, language)}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  loading="lazy"
                                />
                                <Badge 
                                  variant="secondary" 
                                  className="absolute top-3 ltr:left-3 rtl:right-3 bg-background/90 backdrop-blur-sm group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground"
                                >
                                  <IconComponent className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                                  {getLocalizedText(categoryData?.name, language, "Category")}
                                </Badge>
                              </div>
                              <CardContent className="p-5">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-foreground">
                                  {getLocalizedText(event.title, language)}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground group-hover:text-primary-foreground/70">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(event.date).toLocaleDateString(
                                      language === "ar" ? "ar-PS" : "en-US", 
                                      { month: "short", day: "numeric", year: "numeric" }
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {getLocalizedText(event.venue.city, language)}
                                  </span>
                                </div>
                                <p className="mt-3 font-semibold text-primary group-hover:text-primary-foreground">
                                  {t.event.from} {getMinPrice(event.ticketTiers)} {t.common.currency}
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t.discover.noResults}</h3>
                    <p className="text-muted-foreground mb-6">{t.discover.noResultsDesc}</p>
                    <Button variant="outline" onClick={clearFilters}>
                      {t.discover.clearFilters}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label={t.common.previous}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      aria-label={`${t.common.next} ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label={t.common.next}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
