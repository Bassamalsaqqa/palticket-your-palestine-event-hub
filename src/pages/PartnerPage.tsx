import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, BarChart3, Users, Ticket, Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PartnerPage() {
  const { language, t } = useLanguage();
  const baseUrl = "https://palticket.com";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success(t.pages.partner.form.success);
    (e.target as HTMLFormElement).reset();
  };

  const benefits = [
    { icon: Ticket, title: t.pages.partner.benefits.ticketing.title, desc: t.pages.partner.benefits.ticketing.desc },
    { icon: BarChart3, title: t.pages.partner.benefits.analytics.title, desc: t.pages.partner.benefits.analytics.desc },
    { icon: Users, title: t.pages.partner.benefits.audience.title, desc: t.pages.partner.benefits.audience.desc },
    { icon: Headphones, title: t.pages.partner.benefits.support.title, desc: t.pages.partner.benefits.support.desc },
  ];

  const features = t.pages.partner.features;

  return (
    <>
      <Helmet>
        <title>{t.pages.partner.meta.title}</title>
        <meta name="description" content={t.pages.partner.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/partner`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/partner`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/partner`} />
        <meta property="og:title" content={t.pages.partner.meta.title} />
        <meta property="og:description" content={t.pages.partner.meta.description} />
      </Helmet>

      <div className="container py-12 md:py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.partner.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.partner.subtitle}
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">{t.pages.partner.featuresTitle}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Application Form */}
        <section className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t.pages.partner.form.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">{t.pages.partner.form.orgName}</Label>
                    <Input id="orgName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">{t.pages.partner.form.contactName}</Label>
                    <Input id="contactName" required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.pages.partner.form.email}</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.pages.partner.form.phone}</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t.pages.partner.form.website}</Label>
                  <Input id="website" type="url" placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about">{t.pages.partner.form.about}</Label>
                  <Textarea id="about" rows={4} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t.common.loading : t.pages.partner.form.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
