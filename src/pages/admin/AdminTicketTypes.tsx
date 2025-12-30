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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockTicketTypes = [
  { id: "1", name: "VIP", nameAr: "VIP", price: 200, events: 5, color: "#8b5cf6" },
  { id: "2", name: "Regular", nameAr: "عادي", price: 75, events: 8, color: "#3b82f6" },
  { id: "3", name: "Early Bird", nameAr: "حجز مبكر", price: 50, events: 3, color: "#22c55e" },
  { id: "4", name: "Student", nameAr: "طالب", price: 35, events: 4, color: "#f59e0b" },
  { id: "5", name: "Family Pass", nameAr: "تذكرة عائلية", price: 150, events: 2, color: "#ec4899" },
];

export default function AdminTicketTypes() {
  const { language, t } = useLanguage();

  const handleAction = (action: string) => {
    toast.info(`${action} - CRUD not implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.admin.ticketTypes}</h2>
          <p className="text-muted-foreground">{t.admin.ticketTypesDesc}</p>
        </div>
        <Button onClick={() => handleAction("Create ticket type")}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t.admin.createTicketType}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.typeName}</TableHead>
                  <TableHead>{t.admin.basePrice}</TableHead>
                  <TableHead>{t.admin.usedInEvents}</TableHead>
                  <TableHead className="w-24">{t.admin.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTicketTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">
                          {language === "ar" ? type.nameAr : type.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {type.price} {t.common.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{type.events} {t.admin.events}</Badge>
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
