import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const baseUrl = "https://palticket.com";

  const sections = t.pages.privacy.sections;

  return (
    <>
      <Helmet>
        <title>{t.pages.privacy.meta.title}</title>
        <meta name="description" content={t.pages.privacy.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/privacy`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/privacy`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/privacy`} />
        <meta property="og:title" content={t.pages.privacy.meta.title} />
        <meta property="og:description" content={t.pages.privacy.meta.description} />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.privacy.title}</h1>
            <p className="text-muted-foreground">{t.pages.privacy.lastUpdated}</p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
