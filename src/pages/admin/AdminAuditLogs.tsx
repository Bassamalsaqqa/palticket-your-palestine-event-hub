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
import { Search, Calendar, Shield, Edit, Trash2, Plus, Eye, LogIn, LogOut } from "lucide-react";

const mockAuditLogs = [
  { id: "1", user: "Ahmad Hassan", action: "login", target: "System", details: "Login from 192.168.1.1", timestamp: "2025-01-28 14:32:15" },
  { id: "2", user: "Sara Khalil", action: "create", target: "Event: Tech Summit", details: "Created new event", timestamp: "2025-01-28 13:15:42" },
  { id: "3", user: "Omar Nasser", action: "update", target: "Order: PAL-2025-001236", details: "Changed status to confirmed", timestamp: "2025-01-28 12:45:00" },
  { id: "4", user: "Ahmad Hassan", action: "delete", target: "User: test@email.com", details: "Deleted user account", timestamp: "2025-01-28 11:30:22" },
  { id: "5", user: "Layla Mahmoud", action: "view", target: "Export: Tickets Report", details: "Downloaded CSV export", timestamp: "2025-01-28 10:15:00" },
  { id: "6", user: "System", action: "update", target: "Event: Poetry Night", details: "Auto-updated ticket availability", timestamp: "2025-01-28 09:00:00" },
  { id: "7", user: "Khaled Ali", action: "checkin", target: "Ticket: TKT-001234-A", details: "Scanned at Main Gate", timestamp: "2025-01-27 19:45:30" },
  { id: "8", user: "Sara Khalil", action: "logout", target: "System", details: "Logout from admin panel", timestamp: "2025-01-27 18:00:00" },
];

export default function AdminAuditLogs() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4" />;
      case "update":
        return <Edit className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      case "view":
        return <Eye className="h-4 w-4" />;
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "logout":
        return <LogOut className="h-4 w-4" />;
      case "checkin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "update":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "delete":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "login":
      case "logout":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "checkin":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
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
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.admin.action} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.allActions}</SelectItem>
                <SelectItem value="create">{t.admin.actionCreate}</SelectItem>
                <SelectItem value="update">{t.admin.actionUpdate}</SelectItem>
                <SelectItem value="delete">{t.admin.actionDelete}</SelectItem>
                <SelectItem value="login">{t.admin.actionLogin}</SelectItem>
                <SelectItem value="logout">{t.admin.actionLogout}</SelectItem>
                <SelectItem value="checkin">{t.admin.actionCheckin}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">
                    {log.user === "System" ? "SYS" : log.user.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{log.user}</span>
                    <Badge className={getActionColor(log.action)}>
                      <span className="flex items-center gap-1">
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{log.target}</span>
                    {log.details && (
                      <span className="text-muted-foreground"> — {log.details}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
