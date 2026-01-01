import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Ticket,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";

// Mock KPI data
const mockStats = {
  totalRevenue: 45650,
  revenueChange: 12.5,
  totalOrders: 342,
  ordersChange: 8.3,
  ticketsSold: 1248,
  ticketsChange: -2.1,
  activeEvents: 8,
  eventsChange: 25,
};

const mockRecentOrders = [
  { id: "ORD-001", customer: "Ahmad Hassan", event: "Mahmoud Darwish Poetry Night", amount: 150, status: "confirmed" },
  { id: "ORD-002", customer: "Sara Khalil", event: "Palestinian Food Festival", amount: 60, status: "confirmed" },
  { id: "ORD-003", customer: "Omar Nasser", event: "Dabke Championship", amount: 200, status: "pending" },
  { id: "ORD-004", customer: "Layla Mahmoud", event: "Tech Startup Summit", amount: 75, status: "confirmed" },
  { id: "ORD-005", customer: "Khaled Ali", event: "Comedy Night Ramallah", amount: 120, status: "confirmed" },
];

export default function AdminDashboard() {
  const { language, t } = useLanguage();

  const { data: events = [] } = useQuery({
    queryKey: ["adminEvents", language],
    queryFn: () => fetchAllEvents(language),
  });

  const stats = [
    {
      title: t.admin.totalRevenue,
      value: `${mockStats.totalRevenue.toLocaleString()} ${t.common.currency}`,
      change: mockStats.revenueChange,
      icon: DollarSign,
    },
    {
      title: t.admin.totalOrders,
      value: mockStats.totalOrders.toLocaleString(),
      change: mockStats.ordersChange,
      icon: ShoppingCart,
    },
    {
      title: t.admin.ticketsSold,
      value: mockStats.ticketsSold.toLocaleString(),
      change: mockStats.ticketsChange,
      icon: Ticket,
    },
    {
      title: t.admin.activeEvents,
      value: mockStats.activeEvents.toString(),
      change: mockStats.eventsChange,
      icon: Calendar,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "";
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
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-sm mt-1">
                {stat.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 ltr:mr-1 rtl:ml-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 ltr:mr-1 rtl:ml-1" />
                )}
                <span className={stat.change > 0 ? "text-green-500" : "text-red-500"}>
                  {stat.change > 0 ? "+" : ""}{stat.change}%
                </span>
                <span className="text-muted-foreground ltr:ml-1 rtl:mr-1">
                  {t.admin.vsLastMonth}
                </span>
              </div>
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
              {mockRecentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{order.customer}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.event}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="font-medium">
                      {order.amount} {t.common.currency}
                    </span>
                  </div>
                </div>
              ))}
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
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <img
                    src={event.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {language === "ar" ? event.title.ar : event.title.en}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.date} • {language === "ar" ? event.venue.city.ar : event.venue.city.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
