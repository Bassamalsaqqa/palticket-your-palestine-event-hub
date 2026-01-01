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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, Loader2, User, Ticket, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders } from "@/services/ordersService";
import { MockOrder } from "@/types/domain";

export default function AdminOrders() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => fetchAllOrders(),
  });

  const handleViewDetails = (order: MockOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const eventName = order.eventTitle[language] || order.eventTitle.en;
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      eventName.toLowerCase().includes(search.toLowerCase());
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
      case "cancelled":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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
                <SelectItem value="cancelled">{t.account.orderStatus.cancelled}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t.common.noResults || "No orders found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.attendeeName}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.eventTitle[language] || order.eventTitle.en}</TableCell>
                        <TableCell>{order.tickets.reduce((acc, t) => acc + t.quantity, 0)}</TableCell>
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
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.orderDetails || "Order Details"}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {t.admin.orderId}
                  </p>
                  <p className="font-mono text-sm font-bold">{selectedOrder.orderNumber}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {t.account.orderStatus[selectedOrder.status as keyof typeof t.account.orderStatus]}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.customer}</p>
                    <p className="font-medium">{selectedOrder.attendeeName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.eventName}</p>
                    <p className="font-medium">
                      {selectedOrder.eventTitle[language] || selectedOrder.eventTitle.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.total}</p>
                    <p className="font-bold text-lg">
                      {selectedOrder.total} {t.common.currency}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">{t.admin.tickets}</h4>
                </div>
                <div className="space-y-2">
                  {selectedOrder.tickets.map((tkt, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded-lg">
                      <div>
                        <span className="font-medium">{tkt.tierName[language] || tkt.tierName.en}</span>
                        <span className="text-muted-foreground mx-2">×</span>
                        <span>{tkt.quantity}</span>
                      </div>
                      <span className="font-medium">{tkt.price} {t.common.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
