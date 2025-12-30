import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

const mockStaffAssignments = [
  { id: "1", name: "Khaled Ali", event: "Mahmoud Darwish Poetry Night", gate: "Main Entrance", role: "scanner", shift: "18:00 - 22:00" },
  { id: "2", name: "Nadia Yousef", event: "Mahmoud Darwish Poetry Night", gate: "Main Entrance", role: "scanner", shift: "18:00 - 22:00" },
  { id: "3", name: "Sami Hassan", event: "Mahmoud Darwish Poetry Night", gate: "VIP Entrance", role: "scanner", shift: "18:00 - 22:00" },
  { id: "4", name: "Rania Mahmoud", event: "Palestinian Food Festival", gate: "Gate A", role: "coordinator", shift: "10:00 - 18:00" },
  { id: "5", name: "Yousef Nasser", event: "Palestinian Food Festival", gate: "Gate B", role: "scanner", shift: "10:00 - 18:00" },
  { id: "6", name: "Hala Khalil", event: "Dabke Championship", gate: "North Gate", role: "coordinator", shift: "16:00 - 22:00" },
];

export default function AdminStaff() {
  const { language, t } = useLanguage();

  const handleAction = (action: string) => {
    toast.info(`${action} - not implemented`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "coordinator":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "scanner":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.staff}</h2>
          <p className="text-muted-foreground">{t.admin.staffDesc}</p>
        </div>
        <Button onClick={() => handleAction("Assign staff")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.assignStaff}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalAssignments}
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStaffAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.coordinators}
            </CardTitle>
            <UserCog className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStaffAssignments.filter((s) => s.role === "coordinator").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.scanners}
            </CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStaffAssignments.filter((s) => s.role === "scanner").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.staffMember}</TableHead>
                  <TableHead>{t.admin.event}</TableHead>
                  <TableHead>{t.admin.gate}</TableHead>
                  <TableHead>{t.admin.role}</TableHead>
                  <TableHead>{t.admin.shift}</TableHead>
                  <TableHead className="w-24">{t.admin.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStaffAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {assignment.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{assignment.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{assignment.event}</TableCell>
                    <TableCell>{assignment.gate}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(assignment.role)}>
                        {assignment.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment.shift}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction("Edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction("Remove")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
