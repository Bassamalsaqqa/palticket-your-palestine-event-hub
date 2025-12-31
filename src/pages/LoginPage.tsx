import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LocationState = {
  message?: string;
  from?: { pathname: string };
};

export default function LoginPage() {
  const { language, t } = useLanguage();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const message = state?.message;
  const [showPassword, setShowPassword] = useState(false);
  const baseUrl = "https://palticket.com";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success(t.auth.loginSuccess);
      const from = state?.from?.pathname || `/${language}/account`;
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || t.auth.loginError);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t.auth.login} - {t.appName}</title>
        <meta name="description" content={t.auth.loginDesc} />
        <link rel="canonical" href={`${baseUrl}/${language}/login`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/login`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/login`} />
      </Helmet>

      <div className="container py-12 md:py-20 flex flex-col gap-6 items-center justify-center min-h-[calc(100vh-200px)]">
        {message && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t.auth.login}</CardTitle>
            <CardDescription>{t.auth.loginSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.password}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t.auth.passwordPlaceholder}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 ltr:right-0 rtl:left-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Link
                    to={`/${language}/forgot-password`}
                    className="text-sm text-primary hover:underline"
                  >
                    {t.auth.forgotPassword}
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    t.auth.login
                  )}
                </Button>
              </form>
            </Form>

            <div className="my-6">
              <Separator />
              <p className="text-center text-sm text-muted-foreground -mt-3 bg-card px-4 mx-auto w-fit">
                {t.auth.orContinueWith}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                <svg className="h-4 w-4 ltr:mr-2 rtl:ml-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t.auth.google}
              </Button>
              <Button variant="outline" type="button">
                <svg className="h-4 w-4 ltr:mr-2 rtl:ml-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {t.auth.facebook}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.auth.noAccount}{" "}
              <Link to={`/${language}/signup`} className="text-primary font-medium hover:underline">
                {t.auth.signup}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
