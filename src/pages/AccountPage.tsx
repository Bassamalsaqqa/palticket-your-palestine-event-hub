import { Helmet } from "react-helmet-async";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  User,
  ShoppingBag,
  Ticket,
  Settings,
  Calendar,
  MapPin,
  Download,
  Copy,
  LogOut,
  Bell,
  Globe,
  Moon,
  Shield,
} from "lucide-react";

export default function AccountPage() {
  const { language, t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout, updateProfile, orders, tickets } = useAuth();
  const location = useLocation();
  const baseUrl = "https://palticket.com";
  const dateLocale = language === "ar" ? ar : enUS;

  // Get active tab from URL or default to profile
  const hash = location.hash.replace("#", "") || "profile";

  if (!isAuthenticated) {
    return <Navigate to={`/${language}/login`} replace />;
  }

  const handleDownloadQR = (ticketNumber: string, qrCode: string) => {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector(`#qr-${ticketNumber}`) as SVGSVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.download = `${ticketNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
    toast.success(t.account.qrDownloaded);
  };

  const handleCopyLink = (ticketNumber: string) => {
    const link = `${baseUrl}/${language}/ticket/${ticketNumber}`;
    navigator.clipboard.writeText(link);
    toast.success(t.account.linkCopied);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "valid":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
      case "expired":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "used":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const tabs = [
    { id: "profile", label: t.account.profile, icon: User },
    { id: "orders", label: t.account.orders, icon: ShoppingBag },
    { id: "tickets", label: t.account.tickets, icon: Ticket },
    { id: "settings", label: t.account.settings, icon: Settings },
  ];

  return (
    <>
      <Helmet>
        <title>{t.account.title} - {t.appName}</title>
        <meta name="description" content={t.account.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/account`} />
      </Helmet>

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Tabs defaultValue={hash} className="space-y-6">
          <TabsList className="w-full justify-start overflow-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t.account.editProfile}</CardTitle>
                <CardDescription>{t.account.editProfileDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.account.firstName}</Label>
                    <Input defaultValue={user?.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.account.lastName}</Label>
                    <Input defaultValue={user?.lastName} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.auth.email}</Label>
                  <Input defaultValue={user?.email} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>{t.checkout.phone}</Label>
                  <Input defaultValue={user?.phone} type="tel" />
                </div>
                <Button onClick={() => toast.success(t.account.profileUpdated)}>
                  {t.account.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{t.account.orders}</CardTitle>
                <CardDescription>{t.account.ordersDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t.account.noOrders}</p>
                    <p className="text-sm text-muted-foreground">{t.account.noOrdersDesc}</p>
                    <Button asChild className="mt-4">
                      <Link to={`/${language}/discover`}>{t.nav.discover}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <img
                            src={order.eventImage}
                            alt=""
                            className="w-full sm:w-32 h-32 object-cover"
                          />
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link
                                  to={`/${language}/events/${order.eventSlug}`}
                                  className="font-semibold hover:underline"
                                >
                                  {language === "ar" ? order.eventTitle.ar : order.eventTitle.en}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {t.account.orderNumber}: {order.orderNumber}
                                </p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {t.account.orderStatus[order.status as keyof typeof t.account.orderStatus]}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(order.eventDate), "PPP", { locale: dateLocale })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {language === "ar" ? order.eventVenue.ar : order.eventVenue.en}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <span className="font-semibold">
                                {order.total} {t.common.currency}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(order.purchaseDate), "PP", { locale: dateLocale })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>{t.account.tickets}</CardTitle>
                <CardDescription>{t.account.ticketsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t.account.noTickets}</p>
                    <p className="text-sm text-muted-foreground">{t.account.noTicketsDesc}</p>
                    <Button asChild className="mt-4">
                      <Link to={`/${language}/discover`}>{t.nav.discover}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={ticket.eventImage}
                            alt=""
                            className="w-full h-32 object-cover"
                          />
                          <Badge
                            className={`absolute top-2 ltr:right-2 rtl:left-2 ${getStatusColor(ticket.status)}`}
                          >
                            {t.account.ticketStatus[ticket.status as keyof typeof t.account.ticketStatus]}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <Link
                            to={`/${language}/events/${ticket.eventSlug}`}
                            className="font-semibold hover:underline"
                          >
                            {language === "ar" ? ticket.eventTitle.ar : ticket.eventTitle.en}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === "ar" ? ticket.tierName.ar : ticket.tierName.en} • {ticket.attendeeName}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(ticket.eventDate), "PPP", { locale: dateLocale })} • {ticket.eventTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {language === "ar" ? ticket.eventVenue.ar : ticket.eventVenue.en}
                          </div>

                          <Separator className="my-4" />

                          {/* QR Code */}
                          <div className="flex flex-col items-center">
                            <QRCodeSVG
                              id={`qr-${ticket.ticketNumber}`}
                              value={ticket.qrCode}
                              size={120}
                              level="H"
                            />
                            <p className="text-xs text-muted-foreground mt-2">{ticket.ticketNumber}</p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDownloadQR(ticket.ticketNumber, ticket.qrCode)}
                            >
                              <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                              {t.checkout.downloadQR}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCopyLink(ticket.ticketNumber)}
                            >
                              <Copy className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                              {t.account.copyLink}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {t.account.notifications}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.account.emailNotifications}</p>
                      <p className="text-sm text-muted-foreground">{t.account.emailNotificationsDesc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.account.smsNotifications}</p>
                      <p className="text-sm text-muted-foreground">{t.account.smsNotificationsDesc}</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t.account.preferences}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.account.language}</p>
                      <p className="text-sm text-muted-foreground">{t.account.languageDesc}</p>
                    </div>
                    <Badge variant="secondary">{language === "ar" ? "العربية" : "English"}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <p className="font-medium">{t.account.darkMode}</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t.account.security}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {t.account.changePassword}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      toast.success(t.auth.logoutSuccess);
                    }}
                  >
                    <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {t.nav.logout}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
