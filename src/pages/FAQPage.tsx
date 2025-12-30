import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function FAQPage() {
  const { language, t } = useLanguage();
  const baseUrl = "https://palticket.com";
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: t.pages.faq.categories.tickets.title,
      items: t.pages.faq.categories.tickets.items,
    },
    {
      title: t.pages.faq.categories.payment.title,
      items: t.pages.faq.categories.payment.items,
    },
    {
      title: t.pages.faq.categories.account.title,
      items: t.pages.faq.categories.account.items,
    },
    {
      title: t.pages.faq.categories.organizers.title,
      items: t.pages.faq.categories.organizers.items,
    },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return faqCategories;
    const query = searchQuery.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery, faqCategories]);

  // Generate FAQ structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <>
      <Helmet>
        <title>{t.pages.faq.meta.title}</title>
        <meta name="description" content={t.pages.faq.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/faq`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/faq`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/faq`} />
        <meta property="og:title" content={t.pages.faq.meta.title} />
        <meta property="og:description" content={t.pages.faq.meta.description} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.faq.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.faq.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t.pages.faq.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ltr:pl-10 rtl:pr-10"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto space-y-8">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t.pages.faq.noResults}</p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category, catIndex) => (
              <Card key={catIndex}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`${catIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left rtl:text-right">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
