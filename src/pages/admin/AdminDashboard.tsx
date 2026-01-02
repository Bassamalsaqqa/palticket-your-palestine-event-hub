import { useLanguage } from "@/i18n";
import { getLocalizedText } from "@/i18n/localize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Ticket,
  Calendar,
  ArrowUpRight,
  Loader2,
  QrCode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";
import { fetchAdminStats } from "@/services/adminService";
import { fetchAllOrders } from "@/services/ordersService";

export default function AdminDashboard() {
  const { language, t } = useLanguage();

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["adminEvents", language],
    queryFn: () => fetchAllEvents(language),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => fetchAdminStats(),
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "recentOrders"],
    queryFn: () => fetchAllOrders(),
  });

  const isLoading = eventsLoading || statsLoading || ordersLoading;

  const kpiStats = [
    {
      title: t.admin.totalRevenue,
      value: stats ? `${Math.round(stats.totalRevenueCents / 100).toLocaleString()} ${t.common.currency}` : "---",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t.admin.totalOrders,
      value: stats ? stats.totalOrders.toLocaleString() : "---",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: t.admin.ticketsSold,
      value: stats ? stats.totalTickets.toLocaleString() : "---",
      icon: Ticket,
      color: "text-purple-600",
    },
    {
      title: t.scanner.scansToday || "Scans Today",
      value: stats ? stats.scansToday.toLocaleString() : "---",
      icon: QrCode,
      color: "text-orange-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.admin.dashboard}</h2>
        <p className="text-muted-foreground">{t.admin.dashboardDesc}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={stat.color + " h-4 w-4"} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.admin.recentOrders}</CardTitle>
            <Link
              to={`/${language}/admin/orders`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t.home.viewAll}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : recentOrders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t.common.noResults}</p>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{order.attendeeName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getLocalizedText(order.eventTitle, language)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={getStatusColor(order.status)}>
                        {t.account.orderStatus[order.status as keyof typeof t.account.orderStatus] || order.status}
                      </Badge>
                      <span className="font-medium">
                        {order.total} {t.common.currency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.admin.upcomingEvents}</CardTitle>
            <Link
              to={`/${language}/admin/events`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t.home.viewAll}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : events.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t.common.noResults}</p>
              ) : (
                events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 border-b pb-2 last:border-0 last:pb-0">
                    <img
                      src={event.images[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {getLocalizedText(event.title, language, event.slug)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {getLocalizedText(event.venue.city, language)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
