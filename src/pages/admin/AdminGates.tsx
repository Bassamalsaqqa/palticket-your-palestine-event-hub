import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, DoorOpen, Users } from "lucide-react";
import { toast } from "sonner";

const mockGates = [
  { id: "1", name: "Main Entrance", nameAr: "المدخل الرئيسي", event: "Mahmoud Darwish Poetry Night", staff: 3, scans: 156, status: "active" },
  { id: "2", name: "VIP Entrance", nameAr: "مدخل VIP", event: "Mahmoud Darwish Poetry Night", staff: 2, scans: 28, status: "active" },
  { id: "3", name: "Gate A", nameAr: "بوابة أ", event: "Palestinian Food Festival", staff: 4, scans: 0, status: "inactive" },
  { id: "4", name: "Gate B", nameAr: "بوابة ب", event: "Palestinian Food Festival", staff: 4, scans: 0, status: "inactive" },
  { id: "5", name: "North Gate", nameAr: "البوابة الشمالية", event: "Dabke Championship", staff: 5, scans: 0, status: "inactive" },
  { id: "6", name: "South Gate", nameAr: "البوابة الجنوبية", event: "Dabke Championship", staff: 5, scans: 0, status: "inactive" },
];

export default function AdminGates() {
  const { language, t } = useLanguage();

  const handleAction = (action: string) => {
    toast.info(`${action} - not implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.gates}</h2>
          <p className="text-muted-foreground">{t.admin.gatesDesc}</p>
        </div>
        <Button onClick={() => handleAction("Create gate")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.createGate}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalGates}
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.activeGates}
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockGates.filter((g) => g.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.admin.totalStaff}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockGates.reduce((sum, g) => sum + g.staff, 0)}
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
                  <TableHead>{t.admin.gateName}</TableHead>
                  <TableHead>{t.admin.event}</TableHead>
                  <TableHead>{t.admin.assignedStaff}</TableHead>
                  <TableHead>{t.admin.scansToday}</TableHead>
                  <TableHead>{t.admin.status}</TableHead>
                  <TableHead className="w-24">{t.admin.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGates.map((gate) => (
                  <TableRow key={gate.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {language === "ar" ? gate.nameAr : gate.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{gate.event}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{gate.staff}</Badge>
                    </TableCell>
                    <TableCell>{gate.scans}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          gate.status === "active"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {gate.status === "active" ? t.admin.active : t.admin.inactive}
                      </Badge>
                    </TableCell>
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
                          onClick={() => handleAction("Delete")}
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
