import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getApiConfig, setApiConfig, clearApiConfig, getForceMock, setForceMock } from "@/services/apiClient";
import { Save, Trash2, Database, AlertCircle, ServerOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminSettings() {
  const { t } = useLanguage();
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const config = getApiConfig();
    const mock = getForceMock();
    setIsMockMode(mock);
    
    if (config) {
      setBaseUrl(config.baseUrl);
      setToken(config.token);
      setOrganizationId(config.organizationId);
      setIsSaved(true);
    } else if (!mock) {
      const savedBaseUrl = localStorage.getItem("palticket-api-base-url");
      if (savedBaseUrl) {
        setBaseUrl(savedBaseUrl);
        setToken(localStorage.getItem("palticket-api-token") || "");
        setOrganizationId(localStorage.getItem("palticket-org-id") || "");
        setIsSaved(true);
      }
    }
  }, []);

  const handleSave = () => {
    if (!baseUrl || !token || !organizationId) {
      toast.error(t.admin.allFieldsRequired);
      return;
    }

    setApiConfig({ baseUrl, token, organizationId });
    setIsSaved(true);
    toast.success(t.admin.configSaved, {
      onAutoClose: () => window.location.reload(),
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleClear = () => {
    clearApiConfig();
    setBaseUrl("");
    setToken("");
    setOrganizationId("");
    setIsSaved(false);
    toast.info(t.admin.configCleared);
    setTimeout(() => window.location.reload(), 1000);
  };

  const toggleMockMode = (enabled: boolean) => {
    setForceMock(enabled);
    setIsMockMode(enabled);
    toast.success(enabled ? t.admin.mockModeEnabledToast : t.admin.mockModeDisabledToast);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{t.admin.settingsTitle}</h2>
        <p className="text-muted-foreground">
          {t.admin.settingsDesc}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>{t.admin.apiConfigTitle}</CardTitle>
          </div>
          <CardDescription>
            {t.admin.apiConfigDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isMockMode && (
            <Alert variant="destructive">
              <ServerOff className="h-4 w-4" />
              <AlertTitle>{t.admin.mockModeEnabled}</AlertTitle>
              <AlertDescription>
                {t.admin.mockModeEnabledDesc}
              </AlertDescription>
            </Alert>
          )}
          
          {!isSaved && !isMockMode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.admin.noApiConfigured}</AlertTitle>
              <AlertDescription>
                {t.admin.noApiConfiguredDesc}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label className="text-base">{t.admin.forceMock}</Label>
              <p className="text-sm text-muted-foreground">
                {t.admin.forceMockDesc}
              </p>
            </div>
            
            {isMockMode ? (
               <Button variant="secondary" onClick={() => toggleMockMode(false)}>
                 {t.admin.disableMockData}
               </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    {t.admin.useMockData}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.admin.mockConfirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.admin.mockConfirmDesc}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toggleMockMode(true)}>
                      {t.common.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className={`grid gap-4 ${isMockMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-2">
              <Label htmlFor="baseUrl">{t.admin.apiBaseUrl}</Label>
              <Input
                id="baseUrl"
                placeholder="http://localhost:3001"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="ltr:text-left rtl:text-right"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {t.admin.apiBaseUrlDesc}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token">{t.admin.authToken}</Label>
              <Input
                id="token"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="ltr:text-left rtl:text-right"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {t.admin.authTokenDesc}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orgId">{t.admin.organizationId}</Label>
              <Input
                id="orgId"
                placeholder="uuid-v4-format"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="ltr:text-left rtl:text-right"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {t.admin.organizationIdDesc}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleClear} disabled={!isSaved}>
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t.admin.clearConfig}
            </Button>
            <Button onClick={handleSave} disabled={isMockMode}>
              <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t.admin.saveAndReload}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
