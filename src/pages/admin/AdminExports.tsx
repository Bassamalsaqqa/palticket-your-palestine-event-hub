import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { mockEvents } from "@/data/mockEvents";

const mockExportHistory = [
  { id: "1", type: "Orders", format: "CSV", date: "2025-01-28 14:32", size: "245 KB", records: 342 },
  { id: "2", type: "Tickets", format: "Excel", date: "2025-01-27 09:15", size: "1.2 MB", records: 1248 },
  { id: "3", type: "Attendees", format: "CSV", date: "2025-01-26 16:45", size: "156 KB", records: 528 },
  { id: "4", type: "Revenue Report", format: "Excel", date: "2025-01-25 11:20", size: "89 KB", records: 45 },
  { id: "5", type: "Event Summary", format: "PDF", date: "2025-01-24 13:00", size: "2.1 MB", records: 8 },
];

export default function AdminExports() {
  const { language, t } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [exportType, setExportType] = useState("orders");

  const handleExport = (format: string) => {
    toast.success(`${t.admin.exportStarted} (${format.toUpperCase()})`);
  };

  const exportTypes = [
    { id: "orders", label: t.admin.orders, icon: FileText },
    { id: "tickets", label: t.admin.tickets, icon: FileText },
    { id: "attendees", label: t.admin.attendees, icon: FileText },
    { id: "revenue", label: t.admin.revenueReport, icon: FileSpreadsheet },
    { id: "summary", label: t.admin.eventSummary, icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.admin.exports}</h2>
        <p className="text-muted-foreground">{t.admin.exportsDesc}</p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.createExport}</CardTitle>
          <CardDescription>{t.admin.createExportDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.admin.selectEvent}</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectEvent} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.admin.allEvents}</SelectItem>
                  {mockEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {language === "ar" ? event.title.ar : event.title.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.admin.exportType}</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.exportType} />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleExport("csv")} variant="outline">
              <FileText className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.exportCSV}
            </Button>
            <Button onClick={() => handleExport("excel")} variant="outline">
              <FileSpreadsheet className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.exportExcel}
            </Button>
            <Button onClick={() => handleExport("pdf")} variant="outline">
              <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t.admin.exportPDF}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.exportHistory}</CardTitle>
          <CardDescription>{t.admin.exportHistoryDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExportHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {item.format === "Excel" ? (
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    ) : item.format === "PDF" ? (
                      <FileText className="h-5 w-5 text-red-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                      <span>{item.records} {t.admin.records}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{item.format}</Badge>
                  <span className="text-sm text-muted-foreground">{item.size}</span>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
