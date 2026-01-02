import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { acceptInvite } from "@/services/membersService";
import { getApiAuthConfig, getForceMock } from "@/services/apiClient";
import { toast } from "sonner";

export default function AcceptInvitePage() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  const apiAuthConfig = getApiAuthConfig();
  const isMockMode = getForceMock();
  const isApiMissing = !apiAuthConfig || isMockMode;

  useEffect(() => {
    if (!token) {
      setError(t.admin.missingInviteToken);
      setStatus("error");
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login but save this URL to return back
      const returnUrl = `/${language}/accept-invite?token=${token}`;
      toast.info(t.admin.loginToAcceptInvite);
      navigate(`/${language}/login`, { state: { from: { pathname: returnUrl } } });
    }
  }, [token, isAuthenticated, language, navigate, t.admin.missingInviteToken, t.admin.loginToAcceptInvite]);

  const handleAccept = async () => {
    if (!token || isApiMissing) return;
    
    setStatus("loading");
    try {
      const result = await acceptInvite(token);
      setOrgName(result.organization.name);
      setStatus("success");
      toast.success(`${t.admin.successfullyJoined} ${result.organization.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.admin.failedToAcceptInvite;
      setError(msg);
      setStatus("error");
      toast.error(msg);
    }
  };

  if (status === "success") {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{t.admin.inviteAcceptedTitle}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {t.admin.nowMemberOf} <strong>{orgName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button className="w-full" onClick={() => navigate(`/${language}/admin`)}>
              {t.admin.goToDashboard}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.admin.organizationInvitation}</CardTitle>
          <CardDescription>
            {t.admin.invitedToJoinOrg}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 text-center">
          {isApiMissing && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3 text-left mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">{t.admin.apiConfigMissing}</p>
                <p className="text-sm text-yellow-700">{t.admin.apiConfigMissingDesc}</p>
              </div>
            </div>
          )}

          {status === "error" ? (
            <div className="bg-destructive/10 p-4 rounded-lg flex items-start gap-3 text-left">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">{t.admin.error}</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t.admin.clickToAcceptInvite}
            </p>
          )}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleAccept} 
            disabled={status === "loading" || status === "error" || !token || isApiMissing}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.admin.accepting}
              </>
            ) : (
              t.admin.acceptInvitation
            )}
          </Button>
          
          <Button variant="ghost" className="w-full" onClick={() => navigate(`/${language}/discover`)}>
            {t.common.cancel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}