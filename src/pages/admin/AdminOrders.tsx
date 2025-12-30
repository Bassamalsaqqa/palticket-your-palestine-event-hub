import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const mockOrders = [
  { id: "PAL-2025-001234", customer: "Ahmad Hassan", email: "ahmad@email.com", event: "Mahmoud Darwish Poetry Night", tickets: 2, total: 150, date: "2025-01-15", status: "confirmed" },
  { id: "PAL-2025-001235", customer: "Sara Khalil", email: "sara@email.com", event: "Palestinian Food Festival", tickets: 1, total: 60, date: "2025-01-20", status: "confirmed" },
  { id: "PAL-2025-001236", customer: "Omar Nasser", email: "omar@email.com", event: "Dabke Championship", tickets: 4, total: 400, date: "2025-01-22", status: "pending" },
  { id: "PAL-2025-001237", customer: "Layla Mahmoud", email: "layla@email.com", event: "Tech Startup Summit", tickets: 1, total: 75, date: "2025-01-23", status: "confirmed" },
  { id: "PAL-2025-001238", customer: "Khaled Ali", email: "khaled@email.com", event: "Comedy Night Ramallah", tickets: 2, total: 120, date: "2025-01-24", status: "refunded" },
  { id: "PAL-2025-001239", customer: "Nadia Yousef", email: "nadia@email.com", event: "Jerusalem Night Run", tickets: 1, total: 80, date: "2025-01-25", status: "confirmed" },
];

export default function AdminOrders() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "refunded":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.admin.orders}</h2>
        <p className="text-muted-foreground">{t.admin.ordersDesc}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchOrders}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ltr:pl-9 rtl:pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.admin.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
                <SelectItem value="confirmed">{t.account.orderStatus.confirmed}</SelectItem>
                <SelectItem value="pending">{t.account.orderStatus.pending}</SelectItem>
                <SelectItem value="refunded">{t.account.orderStatus.refunded}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.orderId}</TableHead>
                  <TableHead>{t.admin.customer}</TableHead>
                  <TableHead>{t.admin.eventName}</TableHead>
                  <TableHead>{t.admin.tickets}</TableHead>
                  <TableHead>{t.admin.total}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.event}</TableCell>
                    <TableCell>{order.tickets}</TableCell>
                    <TableCell>{order.total} {t.common.currency}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {t.account.orderStatus[order.status as keyof typeof t.account.orderStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.info("View order details - not implemented")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
