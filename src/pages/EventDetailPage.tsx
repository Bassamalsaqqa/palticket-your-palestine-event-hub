import { useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Download,
  Ticket,
  Mail,
  Phone,
  ExternalLink,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEventBySlug, fetchCategories } from "@/services/eventsService";
import { createOrder } from "@/services/ordersService";
import { useAuth } from "@/contexts";

type CheckoutStep = "browse" | "checkout" | "confirmation";

interface TicketSelection {
  tierId: string;
  quantity: number;
}

const attendeeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(9, "Phone number must be at least 9 digits").max(20),
});

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEventBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const category = useMemo(() => categories.find(c => c.id === event?.category), [event, categories]);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
        queryClient.invalidateQueries({ queryKey: ["tickets", user.id] });
      }
      setOrderNumber(data.orderNumber);
      setStep("confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    }
  });

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Checkout state
  const [step, setStep] = useState<CheckoutStep>("browse");
  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [attendeeInfo, setAttendeeInfo] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState("");

  if (isEventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.discover.noResults}</h1>
          <Button asChild>
            <Link to={`/${language}/discover`}>{t.common.back}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % event.images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + event.images.length) % event.images.length);

  const updateQuantity = (tierId: string, delta: number) => {
    setSelections((prev) => {
      const existing = prev.find((s) => s.tierId === tierId);
      const tier = event.ticketTiers.find((t) => t.id === tierId);
      if (!tier) return prev;

      if (existing) {
        const newQty = Math.max(0, Math.min(tier.available, existing.quantity + delta));
        if (newQty === 0) return prev.filter((s) => s.tierId !== tierId);
        return prev.map((s) => (s.tierId === tierId ? { ...s, quantity: newQty } : s));
      } else if (delta > 0) {
        return [...prev, { tierId, quantity: Math.min(delta, tier.available) }];
      }
      return prev;
    });
  };

  const getQuantity = (tierId: string) => selections.find((s) => s.tierId === tierId)?.quantity || 0;

  const calculateTotal = () => {
    return selections.reduce((total, sel) => {
      const tier = event.ticketTiers.find((t) => t.id === sel.tierId);
      return total + (tier ? tier.price * sel.quantity : 0);
    }, 0);
  };

  const serviceFee = Math.round(calculateTotal() * 0.05);
  const grandTotal = calculateTotal() + serviceFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({ title: t.access.loginRequired, variant: "destructive" });
      navigate(`/${language}/login`, { state: { message: t.access.loginRequired, from: location } });
      return;
    }

    if (selections.length === 0) {
      toast({ title: t.event.selectTickets, variant: "destructive" });
      return;
    }
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateAndPay = () => {
    const result = attendeeSchema.safeParse(attendeeInfo);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!user?.id) {
        toast({ title: t.access.loginRequired, variant: "destructive" });
        navigate(`/${language}/login`, { state: { message: t.access.loginRequired, from: location } });
        return;
    }
    
    // Create order using mutation
    const orderTickets = selections.map(sel => {
      const tier = event.ticketTiers.find(t => t.id === sel.tierId);
      return {
        tierId: sel.tierId,
        tierName: tier?.name || { en: "", ar: "" },
        quantity: sel.quantity,
        price: tier?.price || 0,
      };
    });

    createOrderMutation.mutate({
      userId: user.id,
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue.name, // Fixed to use {en, ar} object
      eventImage: event.images[0],
      attendeeName: attendeeInfo.name,
      tickets: orderTickets,
      total: grandTotal,
    });
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `ticket-${orderNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareEvent = async () => {
    const url = `${window.location.origin}/${language}/events/${event.slug}`;
    if (navigator.share) {
      await navigator.share({ title: event.title[language], url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: t.account.linkCopied });
    }
  };

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title[language],
    description: event.description[language],
    startDate: `${event.date}T${event.time}:00`,
    endDate: event.endDate ? `${event.endDate}T23:59:00` : undefined,
    location: {
      "@type": "Place",
      name: event.venue.name[language],
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue.address[language],
        addressLocality: event.venue.city[language],
        addressCountry: "PS",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer.name[language],
    },
    offers: event.ticketTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name[language],
      price: tier.price,
      priceCurrency: "ILS",
      availability: tier.available > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    })),
    image: event.images[0],
  };

  return (
    <>
      <Helmet>
        <title>{event.title[language]} | {t.appName}</title>
        <meta name="description" content={event.description[language].substring(0, 160)} />
        <link rel="canonical" href={`https://palticket.com/${language}/events/${event.slug}`} />
        <link rel="alternate" hrefLang="en" href={`https://palticket.com/en/events/${event.slug}`} />
        <link rel="alternate" hrefLang="ar" href={`https://palticket.com/ar/events/${event.slug}`} />
        <meta property="og:title" content={`${event.title[language]} | ${t.appName}`} />
        <meta property="og:description" content={event.description[language].substring(0, 160)} />
        <meta property="og:image" content={event.images[0]} />
        <meta property="og:type" content="event" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          {step === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Gallery */}
              <section className="relative bg-muted">
                <div className="container py-6">
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Main Image */}
                    <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden group">
                      <img
                        src={event.images[currentImageIndex]}
                        alt={event.title[language]}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                      <button
                        onClick={prevImage}
                        className="absolute top-1/2 -translate-y-1/2 ltr:left-4 rtl:right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        aria-label={t.common.previous}
                      >
                        {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        aria-label={t.common.next}
                      >
                        {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {event.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-primary" : "bg-background/60"}`}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="hidden lg:grid grid-cols-2 gap-4">
                      {event.images.slice(0, 4).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden ring-2 transition-all ${
                            i === currentImageIndex ? "ring-primary" : "ring-transparent hover:ring-primary/50"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Content */}
              <div className="container py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="secondary">{category?.name[language]}</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {event.status === "upcoming" ? (language === "ar" ? "قادم" : "Upcoming") : event.status}
                        </Badge>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title[language]}</h1>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t.event.organizer}: <span className="text-foreground">{event.organizer.name[language]}</span>
                      </p>
                    </div>

                    {/* Date, Time, Venue */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4 flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{t.event.dateTime}</p>
                            <p className="text-muted-foreground">
                              {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {event.time}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{t.event.venue}</p>
                            <p className="text-muted-foreground">{event.venue.name[language]}</p>
                            <p className="text-muted-foreground">{event.venue.city[language]}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Map Placeholder */}
                    <Card className="overflow-hidden">
                      <div className="aspect-[21/9] bg-muted flex items-center justify-center relative">
                        <div className="text-center text-muted-foreground">
                          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>{event.venue.address[language]}, {event.venue.city[language]}</p>
                          <Button variant="link" className="mt-2" asChild>
                            <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(event.venue.name.en + ", " + event.venue.city.en)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {language === "ar" ? "فتح في الخرائط" : "Open in Maps"}
                              <ExternalLink className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Description */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4">{t.event.about}</h2>
                      <p className="text-muted-foreground leading-relaxed">{event.description[language]}</p>
                    </div>

                    {/* Ticket Tiers Table */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4">{t.event.tickets}</h2>
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{language === "ar" ? "نوع التذكرة" : "Ticket Type"}</TableHead>
                              <TableHead>{language === "ar" ? "السعر" : "Price"}</TableHead>
                              <TableHead>{language === "ar" ? "المتاح" : "Available"}</TableHead>
                              <TableHead className="text-center">{t.event.quantity}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {event.ticketTiers.map((tier) => (
                              <TableRow key={tier.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{tier.name[language]}</p>
                                    {tier.description && (
                                      <p className="text-sm text-muted-foreground">{tier.description[language]}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{tier.price} {t.common.currency}</TableCell>
                                <TableCell>
                                  {tier.available > 0 ? (
                                    <span className="text-green-600">{tier.available} {t.event.available}</span>
                                  ) : (
                                    <Badge variant="destructive">{t.event.soldOut}</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(tier.id, -1)}
                                      disabled={getQuantity(tier.id) === 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{getQuantity(tier.id)}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(tier.id, 1)}
                                      disabled={tier.available === 0 || getQuantity(tier.id) >= tier.available}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </div>
                  </div>

                  {/* Sticky Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            {t.checkout.orderSummary}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selections.length > 0 ? (
                            <>
                              {selections.map((sel) => {
                                const tier = event.ticketTiers.find((t) => t.id === sel.tierId);
                                if (!tier) return null;
                                return (
                                  <div key={sel.tierId} className="flex justify-between text-sm">
                                    <span>{tier.name[language]} × {sel.quantity}</span>
                                    <span>{tier.price * sel.quantity} {t.common.currency}</span>
                                  </div>
                                );
                              })}
                              <Separator />
                              <div className="flex justify-between text-sm">
                                <span>{t.checkout.subtotal}</span>
                                <span>{calculateTotal()} {t.common.currency}</span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{t.checkout.serviceFee} (5%)</span>
                                <span>{serviceFee} {t.common.currency}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>{t.checkout.total}</span>
                                <span className="text-primary">{grandTotal} {t.common.currency}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">
                              {t.event.selectTickets}
                            </p>
                          )}
                          <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={handleCheckout}
                            disabled={selections.length === 0}
                          >
                            {t.event.buyNow}
                          </Button>
                        </CardContent>
                      </Card>

                      <Button variant="outline" className="w-full" onClick={shareEvent}>
                        <Share2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.event.shareEvent}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="container py-8 md:py-12"
            >
              <Button variant="ghost" onClick={() => setStep("browse")} className="mb-6">
                {isRTL ? <ChevronRight className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> : <ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />}
                {t.common.back}
              </Button>

              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-8">{t.checkout.title}</h1>

                <div className="grid gap-8">
                  {/* Attendee Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.checkout.attendeeInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.checkout.name}</Label>
                        <div className="relative">
                          <User className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
                          <Input
                            id="name"
                            value={attendeeInfo.name}
                            onChange={(e) => setAttendeeInfo({ ...attendeeInfo, name: e.target.value })}
                            placeholder={language === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                            className="ltr:pl-9 rtl:pr-9"
                          />
                        </div>
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">{t.checkout.email}</Label>
                        <div className="relative">
                          <Mail className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
                          <Input
                            id="email"
                            type="email"
                            value={attendeeInfo.email}
                            onChange={(e) => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })}
                            placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                            className="ltr:pl-9 rtl:pr-9"
                          />
                        </div>
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">{t.checkout.phone}</Label>
                        <div className="relative">
                          <Phone className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
                          <Input
                            id="phone"
                            type="tel"
                            value={attendeeInfo.phone}
                            onChange={(e) => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })}
                            placeholder={language === "ar" ? "أدخل رقم هاتفك" : "Enter your phone number"}
                            className="ltr:pl-9 rtl:pr-9"
                          />
                        </div>
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.checkout.orderSummary}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img src={event.images[0]} alt="" className="w-20 h-14 object-cover rounded-lg" />
                        <div>
                          <p className="font-semibold">{event.title[language]}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US")} • {event.venue.city[language]}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      {selections.map((sel) => {
                        const tier = event.ticketTiers.find((t) => t.id === sel.tierId);
                        if (!tier) return null;
                        return (
                          <div key={sel.tierId} className="flex justify-between">
                            <span>{tier.name[language]} × {sel.quantity}</span>
                            <span>{tier.price * sel.quantity} {t.common.currency}</span>
                          </div>
                        );
                      })}
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>{t.checkout.subtotal}</span>
                        <span>{calculateTotal()} {t.common.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t.checkout.serviceFee}</span>
                        <span>{serviceFee} {t.common.currency}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>{t.checkout.total}</span>
                        <span className="text-primary">{grandTotal} {t.common.currency}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button size="lg" className="w-full" onClick={validateAndPay}>
                    {t.checkout.payNow} • {grandTotal} {t.common.currency}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="container py-12 md:py-20"
            >
              <div className="max-w-md mx-auto text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <Check className="h-10 w-10 text-green-600" />
                </motion.div>

                <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.checkout.success}</h1>
                <p className="text-muted-foreground mb-8">{t.checkout.successMessage}</p>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">{language === "ar" ? "رقم الطلب" : "Order Number"}</p>
                    <p className="font-mono font-bold text-lg mb-6">{orderNumber}</p>

                    <div className="bg-background p-4 rounded-xl inline-block mb-4">
                      <QRCodeSVG
                        id="qr-code"
                        value={`https://palticket.com/verify/${orderNumber}`}
                        size={180}
                        level="H"
                        includeMargin
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {event.title[language]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US")} • {event.time}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={handleDownloadQR}>
                    <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {t.checkout.downloadQR}
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to={`/${language}/account/tickets`}>
                      {t.checkout.viewTickets}
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to={`/${language}`}>
                      {t.checkout.goHome}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}