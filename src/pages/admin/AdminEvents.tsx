import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";

export default function AdminEvents() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");

  const { data: events = [] } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: fetchAllEvents,
  });

  const filteredEvents = events.filter((event) => {
    const title = language === "ar" ? event.title.ar : event.title.en;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ongoing":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "past":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "";
    }
  };

  const handleAction = (action: string, eventId: string) => {
    toast.info(`${action} event ${eventId} - CRUD not implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.events}</h2>
          <p className="text-muted-foreground">{t.admin.eventsDesc}</p>
        </div>
        <Button onClick={() => handleAction("Create", "new")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.createEvent}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchEvents}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ltr:pl-9 rtl:pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.eventName}</TableHead>
                  <TableHead>{t.admin.date}</TableHead>
                  <TableHead>{t.admin.venue}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead>{t.admin.ticketsSold}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={event.images[0]}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">
                          {language === "ar" ? event.title.ar : event.title.en}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>
                      {language === "ar" ? event.venue.city.ar : event.venue.city.en}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.ticketTiers.reduce((sum, t) => sum + (t.total - t.available), 0)} / {event.ticketTiers.reduce((sum, t) => sum + t.total, 0)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("View", event.id)}>
                            <Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.common.view}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Edit", event.id)}>
                            <Edit className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("Delete", event.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
