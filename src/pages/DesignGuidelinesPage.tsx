import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, Type, Image, Layout } from "lucide-react";

export default function DesignGuidelinesPage() {
  const { language, t } = useLanguage();
  const baseUrl = "https://palticket.com";

  const guidelines = [
    { icon: Palette, title: t.pages.designGuidelines.colors.title, content: t.pages.designGuidelines.colors.content },
    { icon: Type, title: t.pages.designGuidelines.typography.title, content: t.pages.designGuidelines.typography.content },
    { icon: Image, title: t.pages.designGuidelines.imagery.title, content: t.pages.designGuidelines.imagery.content },
    { icon: Layout, title: t.pages.designGuidelines.layout.title, content: t.pages.designGuidelines.layout.content },
  ];

  const brandColors = [
    { name: "Primary", color: "hsl(var(--primary))" },
    { name: "Secondary", color: "hsl(var(--secondary))" },
    { name: "Accent", color: "hsl(var(--accent))" },
    { name: "Muted", color: "hsl(var(--muted))" },
  ];

  return (
    <>
      <Helmet>
        <title>{t.pages.designGuidelines.meta.title}</title>
        <meta name="description" content={t.pages.designGuidelines.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/design-guidelines`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/design-guidelines`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/design-guidelines`} />
        <meta property="og:title" content={t.pages.designGuidelines.meta.title} />
        <meta property="og:description" content={t.pages.designGuidelines.meta.description} />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.designGuidelines.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.designGuidelines.subtitle}
          </p>
        </div>

        {/* Logo Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>{t.pages.designGuidelines.logo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold">{t.appName}</span>
                </div>
                <div className="aspect-video bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-background">{t.appName}</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">{t.pages.designGuidelines.logo.usage}</p>
              <Button variant="outline" className="mt-4">
                <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t.pages.designGuidelines.downloadAssets}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>{t.pages.designGuidelines.colors.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {brandColors.map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className="aspect-square rounded-lg mb-2 border"
                      style={{ backgroundColor: c.color }}
                    />
                    <p className="text-sm font-medium">{c.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">{t.pages.designGuidelines.colors.content}</p>
            </CardContent>
          </Card>
        </section>

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-6">
          {guidelines.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
