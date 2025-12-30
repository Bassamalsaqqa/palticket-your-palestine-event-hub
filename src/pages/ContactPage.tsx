import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const { language, t } = useLanguage();
  const baseUrl = "https://palticket.com";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success(t.pages.contact.form.success);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    { icon: Mail, label: t.pages.contact.info.email, value: "hello@palticket.com" },
    { icon: Phone, label: t.pages.contact.info.phone, value: "+970 2 123 4567" },
    { icon: MapPin, label: t.pages.contact.info.address, value: t.pages.contact.info.addressValue },
    { icon: Clock, label: t.pages.contact.info.hours, value: t.pages.contact.info.hoursValue },
  ];

  return (
    <>
      <Helmet>
        <title>{t.pages.contact.meta.title}</title>
        <meta name="description" content={t.pages.contact.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/contact`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/contact`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/contact`} />
        <meta property="og:title" content={t.pages.contact.meta.title} />
        <meta property="og:description" content={t.pages.contact.meta.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: t.pages.contact.meta.title,
            url: `${baseUrl}/${language}/contact`,
          })}
        </script>
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.contact.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t.pages.contact.form.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.pages.contact.form.name}</Label>
                    <Input id="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.pages.contact.form.email}</Label>
                    <Input id="email" type="email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.pages.contact.form.subject}</Label>
                  <Input id="subject" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.pages.contact.form.message}</Label>
                  <Textarea id="message" rows={5} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t.common.loading : t.pages.contact.form.send}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-6">{t.pages.contact.info.title}</h3>
                <div className="space-y-4">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
