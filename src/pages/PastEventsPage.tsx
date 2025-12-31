import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";

export default function PastEventsPage() {
  const { language, t, isRTL } = useLanguage();
  const baseUrl = "https://palticket.com";
  const dateLocale = language === "ar" ? ar : enUS;

  const { data: events = [] } = useQuery({
    queryKey: ["pastEvents"],
    queryFn: fetchAllEvents,
  });

  // Filter past events (mock: events with dates before today)
  const pastEvents = events
    .filter((event) => new Date(event.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // If no past events, show some mock past data
  const displayEvents = pastEvents.length > 0 ? pastEvents : events.slice(0, 6);

  return (
    <>
      <Helmet>
        <title>{t.pages.pastEvents.meta.title}</title>
        <meta name="description" content={t.pages.pastEvents.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/past-events`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/past-events`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/past-events`} />
        <meta property="og:title" content={t.pages.pastEvents.meta.title} />
        <meta property="og:description" content={t.pages.pastEvents.meta.description} />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.pastEvents.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.pastEvents.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "150+", label: t.pages.pastEvents.stats.events },
            { value: "50K+", label: t.pages.pastEvents.stats.attendees },
            { value: "12", label: t.pages.pastEvents.stats.cities },
            { value: "100+", label: t.pages.pastEvents.stats.organizers },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event) => (
          <Link key={event.id} to={`/${language}/events/${event.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="aspect-video relative">
                <img
                  src={event.images[0]}
                  alt={language === "ar" ? event.title.ar : event.title.en}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 ltr:right-3 rtl:left-3" variant="secondary">
                  {t.pages.pastEvents.completed}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">
                  {language === "ar" ? event.title.ar : event.title.en}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.date), "PPP", { locale: dateLocale })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{language === "ar" ? event.venue.city.ar : event.venue.city.en}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 500 + 100)} {t.pages.pastEvents.attendees}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
