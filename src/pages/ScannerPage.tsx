import { useState, useEffect, useRef, useCallback } from "react";
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
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  History,
  ArrowLeft,
  User,
  DoorOpen,
  Calendar,
  RefreshCw,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "@/services/eventsService";
import { fetchAllGates, scanTicket } from "@/services/gatesService";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useAuth } from "@/contexts";
import { useNavigate, useLocation } from "react-router-dom";

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

export default function ScannerPage() {
  const { language, t } = useLanguage();
  const { isAuthenticated, user, isAdmin, isStaff, login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: events = [] } = useQuery({
    queryKey: ["scannerEvents", language],
    queryFn: () => fetchAllEvents(language),
  });

  const { data: gates = [] } = useQuery({
    queryKey: ["adminGates"],
    queryFn: () => fetchAllGates(),
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
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Auto-skip login if already authenticated as staff/admin
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin || isStaff) {
        if (step === "login") {
          setStep("select-event");
        }
      } else {
        // If logged in but not staff/admin, redirect to login with message
        toast.error(t.auth.unauthorized || "Unauthorized access");
        navigate(`/${language}/login`, { state: { from: location } });
      }
    }
  }, [isAuthenticated, isAdmin, isStaff, step, navigate, language, location, t.auth.unauthorized]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await authLogin(email, password);
    if (result.success) {
      toast.success(t.scanner.loginSuccess || "Login successful");
      // useEffect above will handle step transition
    } else {
      toast.error(result.error || "Login failed");
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

  const getResultReason = useCallback((result: ScanResult): string => {
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
  }, [t.scanner]);

  const handleScan = useCallback(async (code: string) => {
    if (isScanning) return;
    setIsScanning(true);
    
    try {
      const response = await scanTicket(code, selectedGate, selectedEvent);
      
      let mappedResult: ScanResult = "denied-invalid";
      if (response.result === "GRANTED") mappedResult = "allowed";
      else if (response.result === "DENIED_ALREADY_USED") mappedResult = "denied-used";
      else if (response.result === "DENIED_INVALID_EVENT") mappedResult = "denied-wrong-event";

      const record: ScanRecord = {
        id: `scan-${Date.now()}`,
        ticketId: code,
        attendeeName: response.ticket?.attendeeName || "Unknown",
        result: mappedResult,
        reason: response.message || getResultReason(mappedResult),
        timestamp: new Date(),
      };
      
      setScanResult(mappedResult);
      setLastScannedTicket(record);
      setScanHistory(prev => [record, ...prev].slice(0, 50));
      setStep("result");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, selectedGate, selectedEvent, getResultReason]);

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode("");
    }
  }, [manualCode, handleScan]);

  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null;
    let stream: MediaStream | null = null;
    const currentVideo = videoRef.current;

    const startCamera = async () => {
      setCameraError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }
        });
        
        if (currentVideo) {
          currentVideo.srcObject = stream;
          // Play is needed for some browsers to actually start the stream
          await currentVideo.play();
        }

        reader = new BrowserMultiFormatReader();
        codeReaderRef.current = reader;
        
        if (currentVideo) {
          reader.decodeFromVideoElement(currentVideo, (result) => {
            if (result) {
              handleScan(result.getText());
            }
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
        const errMsg = t.scanner.cameraError || "Camera access denied or unavailable";
        setCameraError(errMsg);
        toast.error(errMsg);
      }
    };

    if (step === "scanning" && !showHistory) {
      startCamera();
    }

    return () => {
      if (reader) {
        reader.reset();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
    };
  }, [step, showHistory, handleScan, t.scanner]);

  const scanAnother = () => {
    setScanResult(null);
    setLastScannedTicket(null);
    setStep("scanning");
  };

  const goBack = () => {
    switch (step) {
      case "select-event": setStep("login"); break;
      case "select-gate": setStep("select-event"); break;
      case "scanning": setStep("select-gate"); break;
      case "result": setStep("scanning"); break;
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const currentGate = gates.find(g => g.id === selectedGate);

  return (
    <>
      <Helmet>
        <title>{t.scanner.title} - {t.appName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
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
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        <main className="container px-4 py-6 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                        <Input id="email" type="email" placeholder="staff@palticket.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">{t.auth.password}</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
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

            {step === "select-event" && (
              <motion.div key="select-event" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                      <SelectTrigger className="h-12"><SelectValue placeholder={t.scanner.selectEvent} /></SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>{language === "ar" ? event.title.ar : event.title.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleEventSelect} className="w-full" size="lg" disabled={!selectedEvent}>{t.common.next}</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "select-gate" && (
              <motion.div key="select-gate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <DoorOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{t.scanner.selectGate}</CardTitle>
                    <CardDescription>{selectedEventData && <span className="text-primary font-medium">{language === "ar" ? selectedEventData.title.ar : selectedEventData.title.en}</span>}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedGate} onValueChange={setSelectedGate}>
                      <SelectTrigger className="h-12"><SelectValue placeholder={t.scanner.selectGate} /></SelectTrigger>
                      <SelectContent>
                        {gates.filter(g => g.eventId === selectedEvent).map((gate) => (
                          <SelectItem key={gate.id} value={gate.id}>{gate.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleGateSelect} className="w-full" size="lg" disabled={!selectedGate}>{t.scanner.startScanning}</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "scanning" && !showHistory && (
              <motion.div key="scanning" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{selectedEventData && (language === "ar" ? selectedEventData.title.ar : selectedEventData.title.en)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{currentGate?.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-black relative flex items-center justify-center">
                    {cameraError ? (
                      <div className="text-center p-6 space-y-4">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                        <p className="text-white text-sm font-medium">{cameraError}</p>
                        <Button variant="outline" size="sm" onClick={() => setStep("select-gate")} className="text-white border-white hover:bg-white/10">
                          {t.common.back || "Back"}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          muted
                          playsInline
                          autoPlay
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {isScanning && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
                            <RefreshCw className="h-12 w-12 text-white animate-spin" />
                          </div>
                        )}
                        
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg z-20" />
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg z-20" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg z-20" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg z-20" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-2 border-white/30 rounded-lg" />
                        </div>
                      </>
                    )}
                  </div>
                  <CardContent className="pt-4 space-y-4">
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <Input placeholder={t.scanner.ticketId} value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
                      <Button type="submit" size="icon" disabled={!manualCode.trim() || isScanning}><Search className="h-4 w-4" /></Button>
                    </form>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-3 gap-3">
                  <Card><CardContent className="py-3 text-center px-1"><p className="text-2xl font-bold text-green-600">{scanHistory.filter(s => s.result === "allowed").length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.scanner.allowed}</p></CardContent></Card>
                  <Card><CardContent className="py-3 text-center px-1"><p className="text-2xl font-bold text-red-600">{scanHistory.filter(s => s.result !== "allowed").length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.scanner.denied}</p></CardContent></Card>
                  <Card><CardContent className="py-3 text-center px-1"><p className="text-2xl font-bold">{scanHistory.length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.scanner.total}</p></CardContent></Card>
                </div>
              </motion.div>
            )}

            {step === "scanning" && showHistory && (
              <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{t.scanner.recentScans}</h2><Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>{t.common.back}</Button></div>
                {scanHistory.length === 0 ? (
                  <Card><CardContent className="py-12 text-center"><History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">{t.scanner.noScansYet}</p></CardContent></Card>
                ) : (
                  <div className="space-y-2">
                    {scanHistory.map((scan) => (
                      <Card key={scan.id} className={scan.result === "allowed" ? "border-green-500/20" : "border-red-500/20"}>
                        <CardContent className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${scan.result === "allowed" ? "bg-green-500/10" : "bg-red-500/10"}`}>{scan.result === "allowed" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</div>
                            <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="font-medium truncate text-sm">{scan.attendeeName}</p><span className="text-[10px] text-muted-foreground">{scan.timestamp.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
                            <div className="flex items-center gap-2 mt-1"><code className="text-[10px] text-muted-foreground bg-muted px-1 rounded truncate">{scan.ticketId}</code><Badge variant="secondary" className={scan.result === "allowed" ? "bg-green-500/10 text-green-600 text-[10px] h-4 py-0" : "bg-red-500/10 text-red-600 text-[10px] h-4 py-0"}>{scan.reason}</Badge></div></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === "result" && lastScannedTicket && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
                <Card className={`overflow-hidden ${scanResult === "allowed" ? "border-green-500 border-2" : "border-red-500 border-2"}`}>
                  <div className={`py-12 text-center ${scanResult === "allowed" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>{scanResult === "allowed" ? <CheckCircle2 className="h-24 w-24 mx-auto text-green-600" /> : <XCircle className="h-24 w-24 mx-auto text-red-600" />}</motion.div>
                    <motion.h2 className={`text-2xl font-bold mt-4 ${scanResult === "allowed" ? "text-green-600" : "text-red-600"}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{scanResult === "allowed" ? t.scanner.allowed : t.scanner.denied}</motion.h2>
                    {scanResult !== "allowed" && <motion.div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><AlertTriangle className="h-4 w-4" /><span>{lastScannedTicket.reason}</span></motion.div>}
                  </div>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-muted-foreground">{t.scanner.ticketId}</p><p className="font-mono font-medium truncate">{lastScannedTicket.ticketId}</p></div>
                      <div><p className="text-muted-foreground">{t.scanner.attendee}</p><p className="font-medium truncate">{lastScannedTicket.attendeeName}</p></div>
                      <div><p className="text-muted-foreground">{t.scanner.time}</p><p className="font-medium">{lastScannedTicket.timestamp.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US")}</p></div>
                      <div><p className="text-muted-foreground">{t.scanner.gate}</p><p className="font-medium truncate">{currentGate?.name}</p></div>
                    </div>
                    <Button onClick={scanAnother} className="w-full" size="lg"><QrCode className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.scanner.scanAnother}</Button>
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
