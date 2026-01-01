import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Search, QrCode, Loader2, User, Calendar, MapPin, Tag, Clock, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTickets } from "@/services/ticketsService";
import { MockTicket } from "@/types/domain";

export default function AdminTickets() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<MockTicket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => fetchAllTickets(),
  });

  const handleRowClick = (ticket: MockTicket) => {
    setSelectedTicket(ticket);
    setIsDetailsOpen(true);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const eventName = ticket.eventTitle[language] || ticket.eventTitle.en;
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      eventName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "used":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "expired":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.admin.tickets}</h2>
        <p className="text-muted-foreground">{t.admin.ticketsDesc}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchTickets}
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
                <SelectItem value="valid">{t.account.ticketStatus.valid}</SelectItem>
                <SelectItem value="used">{t.account.ticketStatus.used}</SelectItem>
                <SelectItem value="cancelled">{t.account.ticketStatus.cancelled}</SelectItem>
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
                    <TableHead>{t.admin.ticketId}</TableHead>
                    <TableHead>{t.admin.attendee}</TableHead>
                    <TableHead>{t.admin.eventName}</TableHead>
                    <TableHead>{t.admin.tier}</TableHead>
                    <TableHead>{t.admin.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {t.common.noResults || "No tickets found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow 
                        key={ticket.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(ticket)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.attendeeName}</TableCell>
                        <TableCell>{ticket.eventTitle[language] || ticket.eventTitle.en}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.tierName[language] || ticket.tierName.en}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {t.account.ticketStatus[ticket.status as keyof typeof t.account.ticketStatus]}
                          </Badge>
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
            <DialogTitle>{t.admin.ticketDetails || "Ticket Details"}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {t.admin.ticketId}
                  </p>
                  <p className="font-mono text-sm font-bold">{selectedTicket.ticketNumber}</p>
                </div>
                <Badge className={getStatusColor(selectedTicket.status)}>
                  {t.account.ticketStatus[selectedTicket.status as keyof typeof t.account.ticketStatus]}
                </Badge>
              </div>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.attendee}</p>
                    <p className="font-medium">{selectedTicket.attendeeName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.eventName}</p>
                    <p className="font-medium">
                      {selectedTicket.eventTitle[language] || selectedTicket.eventTitle.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.tier}</p>
                    <p className="font-medium">
                      {selectedTicket.tierName[language] || selectedTicket.tierName.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.admin.venue}</p>
                    <p className="font-medium">
                      {selectedTicket.eventVenue[language] || selectedTicket.eventVenue.en}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTicket.scanHistory && selectedTicket.scanHistory.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">{t.admin.scanHistory || "Scan History"}</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedTicket.scanHistory.map((scan, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(scan.scannedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}</span>
                          </div>
                          {scan.gateName && (
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-3 w-3 text-muted-foreground" />
                              <span>{scan.gateName}</span>
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant="secondary"
                          className={scan.result === "GRANTED" 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-red-500/10 text-red-600"
                          }
                        >
                          {scan.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
