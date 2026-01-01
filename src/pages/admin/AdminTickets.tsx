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
import { Search, QrCode, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTickets } from "@/services/ticketsService";

export default function AdminTickets() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => fetchAllTickets(),
  });

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
                      <TableRow key={ticket.id}>
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
    </div>
  );
}
