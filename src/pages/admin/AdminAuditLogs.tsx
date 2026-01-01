import { useState } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Shield, Loader2, QrCode, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchScanLogs } from "@/services/scansService";

export default function AdminAuditLogs() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin", "scanLogs"],
    queryFn: () => fetchScanLogs(),
  });

  const filteredLogs = logs.filter((log) => {
    const attendee = log.ticket.attendeeName || "";
    const eventName = log.ticket.event.translations[0]?.name || "";
    const matchesSearch =
      attendee.toLowerCase().includes(search.toLowerCase()) ||
      log.ticket.code.toLowerCase().includes(search.toLowerCase()) ||
      eventName.toLowerCase().includes(search.toLowerCase());
    const matchesResult = resultFilter === "all" || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const getResultIcon = (result: string) => {
    switch (result) {
      case "GRANTED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "DENIED_ALREADY_USED":
        return <AlertTriangle className="h-4 w-4" />;
      case "DENIED_INVALID_EVENT":
      case "DENIED_INVALID_TICKET":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "GRANTED":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "DENIED_ALREADY_USED":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "DENIED_INVALID_EVENT":
      case "DENIED_INVALID_TICKET":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.admin.auditLogs}</h2>
        <p className="text-muted-foreground">{t.admin.auditLogsDesc}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin.searchLogs}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ltr:pl-9 rtl:pr-9"
              />
            </div>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.admin.action} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allActions}</SelectItem>
                <SelectItem value="GRANTED">GRANTED</SelectItem>
                <SelectItem value="DENIED_ALREADY_USED">ALREADY USED</SelectItem>
                <SelectItem value="DENIED_INVALID_EVENT">WRONG EVENT</SelectItem>
                <SelectItem value="DENIED_INVALID_TICKET">INVALID TICKET</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.common.noResults}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-xs">
                      {log.scannedBy?.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.scannedBy?.name || "System"}</span>
                        <Badge className={getResultColor(log.result)}>
                          <span className="flex items-center gap-1">
                            {getResultIcon(log.result)}
                            {log.result}
                          </span>
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.scannedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      <span className="font-medium">{log.ticket.attendeeName || "---"}</span>
                      <span className="text-muted-foreground"> — {log.ticket.event.translations[0]?.name}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <QrCode className="h-3 w-3" />
                        <code className="bg-muted px-1 rounded">{log.ticket.code}</code>
                      </div>
                      {log.gate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>{log.gate.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
