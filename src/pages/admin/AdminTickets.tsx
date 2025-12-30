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
import { Search, QrCode } from "lucide-react";

const mockTickets = [
  { id: "TKT-001234-A", order: "PAL-2025-001234", attendee: "Ahmad Hassan", event: "Mahmoud Darwish Poetry Night", tier: "Regular", status: "valid", checkedIn: false },
  { id: "TKT-001234-B", order: "PAL-2025-001234", attendee: "Sara Khalil", event: "Mahmoud Darwish Poetry Night", tier: "Regular", status: "valid", checkedIn: false },
  { id: "TKT-001235-A", order: "PAL-2025-001235", attendee: "Sara Khalil", event: "Palestinian Food Festival", tier: "Weekend Pass", status: "valid", checkedIn: false },
  { id: "TKT-001236-A", order: "PAL-2025-001236", attendee: "Omar Nasser", event: "Dabke Championship", tier: "VIP", status: "used", checkedIn: true },
  { id: "TKT-001236-B", order: "PAL-2025-001236", attendee: "Layla Mahmoud", event: "Dabke Championship", tier: "VIP", status: "used", checkedIn: true },
  { id: "TKT-001237-A", order: "PAL-2025-001237", attendee: "Layla Mahmoud", event: "Tech Startup Summit", tier: "General", status: "valid", checkedIn: false },
  { id: "TKT-001238-A", order: "PAL-2025-001238", attendee: "Khaled Ali", event: "Comedy Night Ramallah", tier: "Front Row", status: "cancelled", checkedIn: false },
];

export default function AdminTickets() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.attendee.toLowerCase().includes(search.toLowerCase()) ||
      ticket.event.toLowerCase().includes(search.toLowerCase());
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.ticketId}</TableHead>
                  <TableHead>{t.admin.attendee}</TableHead>
                  <TableHead>{t.admin.eventName}</TableHead>
                  <TableHead>{t.admin.tier}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.admin.checkedIn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{ticket.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.attendee}</TableCell>
                    <TableCell>{ticket.event}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {t.account.ticketStatus[ticket.status as keyof typeof t.account.ticketStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.checkedIn ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          {t.admin.yes}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{t.admin.no}</Badge>
                      )}
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
