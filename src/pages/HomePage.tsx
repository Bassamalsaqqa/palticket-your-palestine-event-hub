import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, ArrowRight, Music, Trophy, Palette, UtensilsCrossed, Users, PartyPopper } from "lucide-react";
import { getFeaturedEvents, categories } from "@/data/mockEvents";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  Music, Trophy, Palette, UtensilsCrossed, Users, PartyPopper,
};

export default function HomePage() {
  const { language, t, isRTL } = useLanguage();
  const featuredEvents = getFeaturedEvents();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              {t.home.heroSubtitle}
            </p>

            {/* Search Bar */}
            <div className="bg-background/10 backdrop-blur-md rounded-2xl p-2 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60 ltr:left-4 rtl:right-4" />
                  <Input
                    placeholder={t.home.searchPlaceholder}
                    className="bg-transparent border-0 text-primary-foreground placeholder:text-primary-foreground/50 h-12 ltr:pl-12 rtl:pr-12"
                  />
                </div>
                <Button variant="hero-solid" size="lg">
                  {t.common.search}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t.home.featuredEvents}</h2>
            <Button variant="ghost" asChild>
              <Link to={`/${language}/discover`}>
                {t.home.viewAll}
                <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.slice(0, 3).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/${language}/events/${event.slug}`}>
                  <Card variant="interactive" className="overflow-hidden h-full">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={event.images[0]}
                        alt={event.title[language]}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3 group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground">
                        {categories.find(c => c.id === event.category)?.name[language]}
                      </Badge>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-foreground">
                        {event.title[language]}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground group-hover:text-primary-foreground/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue.city[language]}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-primary group-hover:text-primary-foreground">
                        {t.event.from} {Math.min(...event.ticketTiers.map(t => t.price))} {t.common.currency}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.home.categories}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category, index) => {
              const IconComponent = iconMap[category.icon] || Music;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/${language}/discover?category=${category.id}`}>
                    <Card variant="interactive" className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                        <IconComponent className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <span className="font-medium">{category.name[language]}</span>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="bg-gradient-hero text-primary-foreground p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.home.partnerTitle}</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">{t.home.partnerSubtitle}</p>
            <Button variant="hero-solid" size="lg" asChild>
              <Link to={`/${language}/partner`}>{t.home.partnerCta}</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
