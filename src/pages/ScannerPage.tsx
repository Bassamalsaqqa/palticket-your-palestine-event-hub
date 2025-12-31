import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  QrCode, 
  LogIn, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  History,
  ArrowLeft,
  User,
  DoorOpen,
  Calendar,
  Clock,
  ScanLine,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";

type ScanStep = "login" | "select-event" | "select-gate" | "scanning" | "result";
type ScanResult = "allowed" | "denied-used" | "denied-wrong-event" | "denied-invalid" | null;

interface ScanRecord {
  id: string;
  ticketId: string;
  attendeeName: string;
  result: ScanResult;
  reason: string;
  timestamp: Date;
}

const mockGates = [
  { id: "1", name: "Main Entrance", nameAr: "المدخل الرئيسي" },
  { id: "2", name: "VIP Entrance", nameAr: "مدخل VIP" },
  { id: "3", name: "Gate A", nameAr: "بوابة أ" },
  { id: "4", name: "Gate B", nameAr: "بوابة ب" },
];

export default function ScannerPage() {
  const { language, t } = useLanguage();
  const langPrefix = `/${language}`;
  
  const { data: events = [] } = useQuery({
    queryKey: ["scannerEvents"],
    queryFn: fetchAllEvents,
  });

  const [step, setStep] = useState<ScanStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedGate, setSelectedGate] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [lastScannedTicket, setLastScannedTicket] = useState<ScanRecord | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      toast.success(t.scanner.loginSuccess || "Login successful");
      setStep("select-event");
    }
  };

  const handleEventSelect = () => {
    if (selectedEvent) {
      setStep("select-gate");
    }
  };

  const handleGateSelect = () => {
    if (selectedGate) {
      setStep("scanning");
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const results: ScanResult[] = ["allowed", "denied-used", "denied-wrong-event", "denied-invalid"];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      
      const names = ["Ahmad Hassan", "Sara Khalil", "Omar Nasser", "Layla Mahmoud", "Khaled Ali"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      const record: ScanRecord = {
        id: `scan-${Date.now()}`,
        ticketId: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        attendeeName: randomName,
        result: randomResult,
        reason: getResultReason(randomResult),
        timestamp: new Date(),
      };
      
      setScanResult(randomResult);
      setLastScannedTicket(record);
      setScanHistory(prev => [record, ...prev].slice(0, 50));
      setIsScanning(false);
      setStep("result");
    }, 1500);
  };

  const getResultReason = (result: ScanResult): string => {
    switch (result) {
      case "allowed":
        return t.scanner.allowed;
      case "denied-used":
        return t.scanner.alreadyUsed;
      case "denied-wrong-event":
        return t.scanner.wrongEvent;
      case "denied-invalid":
        return t.scanner.invalid;
      default:
        return "";
    }
  };

  const scanAnother = () => {
    setScanResult(null);
    setLastScannedTicket(null);
    setStep("scanning");
  };

  const goBack = () => {
    switch (step) {
      case "select-event":
        setStep("login");
        break;
      case "select-gate":
        setStep("select-event");
        break;
      case "scanning":
        setStep("select-gate");
        break;
      case "result":
        setStep("scanning");
        break;
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const selectedGateData = mockGates.find(g => g.id === selectedGate);

  return (
    <>
      <Helmet>
        <title>{t.scanner.title} - {t.appName}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              {step !== "login" && (
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                <span className="font-bold">{t.scanner.title}</span>
              </div>
            </div>
            {step === "scanning" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        <main className="container px-4 py-6 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* Login Step */}
            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{t.scanner.staffLogin}</CardTitle>
                    <CardDescription>{t.scanner.staffLoginDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.auth.email}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="staff@palticket.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">{t.auth.password}</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg">
                        <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.auth.login}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Select Event Step */}
            {step === "select-event" && (
              <motion.div
                key="select-event"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{t.scanner.selectEvent}</CardTitle>
                    <CardDescription>{t.scanner.selectEventDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t.scanner.selectEvent} />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {language === "ar" ? event.title.ar : event.title.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleEventSelect} 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedEvent}
                    >
                      {t.common.next}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Select Gate Step */}
            {step === "select-gate" && (
              <motion.div
                key="select-gate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <DoorOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{t.scanner.selectGate}</CardTitle>
                    <CardDescription>
                      {selectedEventData && (
                        <span className="text-primary font-medium">
                          {language === "ar" ? selectedEventData.title.ar : selectedEventData.title.en}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedGate} onValueChange={setSelectedGate}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t.scanner.selectGate} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockGates.map((gate) => (
                          <SelectItem key={gate.id} value={gate.id}>
                            {language === "ar" ? gate.nameAr : gate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleGateSelect} 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedGate}
                    >
                      {t.scanner.startScanning}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Scanning Step */}
            {step === "scanning" && !showHistory && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Event & Gate Info */}
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[150px]">
                          {selectedEventData && (language === "ar" ? selectedEventData.title.ar : selectedEventData.title.en)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedGateData && (language === "ar" ? selectedGateData.nameAr : selectedGateData.name)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Camera Placeholder */}
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
                    {isScanning ? (
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <ScanLine className="h-20 w-20 text-primary animate-pulse" />
                          <motion.div 
                            className="absolute inset-0 border-2 border-primary rounded-lg"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                        <p className="text-muted-foreground">{t.scanner.scanning}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-48 h-48 mx-auto border-2 border-dashed border-primary/50 rounded-xl flex items-center justify-center">
                          <Camera className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground">{t.scanner.cameraPlaceholder}</p>
                      </div>
                    )}
                    
                    {/* Scan overlay corners */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                  <CardContent className="pt-4">
                    <Button 
                      onClick={simulateScan} 
                      className="w-full" 
                      size="lg"
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                          {t.scanner.scanning}
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                          {t.scanner.tapToScan}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {scanHistory.filter(s => s.result === "allowed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.scanner.allowed}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {scanHistory.filter(s => s.result !== "allowed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.scanner.denied}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold">{scanHistory.length}</p>
                      <p className="text-xs text-muted-foreground">{t.scanner.total}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Scan History */}
            {step === "scanning" && showHistory && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t.scanner.recentScans}</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>
                    {t.common.back}
                  </Button>
                </div>
                
                {scanHistory.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">{t.scanner.noScansYet}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {scanHistory.map((scan) => (
                      <Card key={scan.id} className={scan.result === "allowed" ? "border-green-500/20" : "border-red-500/20"}>
                        <CardContent className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              scan.result === "allowed" 
                                ? "bg-green-500/10" 
                                : "bg-red-500/10"
                            }`}>
                              {scan.result === "allowed" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{scan.attendeeName}</p>
                                <span className="text-xs text-muted-foreground">
                                  {scan.timestamp.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", { 
                                    hour: "2-digit", 
                                    minute: "2-digit" 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs text-muted-foreground">{scan.ticketId}</code>
                                <Badge 
                                  variant="secondary"
                                  className={scan.result === "allowed" 
                                    ? "bg-green-500/10 text-green-600 text-xs" 
                                    : "bg-red-500/10 text-red-600 text-xs"
                                  }
                                >
                                  {scan.reason}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Result Step */}
            {step === "result" && lastScannedTicket && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <Card className={`overflow-hidden ${
                  scanResult === "allowed" 
                    ? "border-green-500 border-2" 
                    : "border-red-500 border-2"
                }`}>
                  <div className={`py-12 text-center ${
                    scanResult === "allowed" 
                      ? "bg-green-500/10" 
                      : "bg-red-500/10"
                  }`}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      {scanResult === "allowed" ? (
                        <CheckCircle2 className="h-24 w-24 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="h-24 w-24 mx-auto text-red-600" />
                      )}
                    </motion.div>
                    <motion.h2 
                      className={`text-2xl font-bold mt-4 ${
                        scanResult === "allowed" ? "text-green-600" : "text-red-600"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {scanResult === "allowed" ? t.scanner.allowed : t.scanner.denied}
                    </motion.h2>
                    {scanResult !== "allowed" && (
                      <motion.div
                        className="flex items-center justify-center gap-2 mt-2 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>{lastScannedTicket.reason}</span>
                      </motion.div>
                    )}
                  </div>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t.scanner.ticketId}</p>
                        <p className="font-mono font-medium">{lastScannedTicket.ticketId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.scanner.attendee}</p>
                        <p className="font-medium">{lastScannedTicket.attendeeName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.scanner.time}</p>
                        <p className="font-medium">
                          {lastScannedTicket.timestamp.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.scanner.gate}</p>
                        <p className="font-medium">
                          {selectedGateData && (language === "ar" ? selectedGateData.nameAr : selectedGateData.name)}
                        </p>
                      </div>
                    </div>
                    <Button onClick={scanAnother} className="w-full" size="lg">
                      <QrCode className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t.scanner.scanAnother}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
