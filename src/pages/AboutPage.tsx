import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Globe } from "lucide-react";

export default function AboutPage() {
  const { language, t, isRTL } = useLanguage();
  const baseUrl = "https://palticket.com";

  const values = [
    { icon: Heart, title: t.pages.about.values.passion, desc: t.pages.about.values.passionDesc },
    { icon: Users, title: t.pages.about.values.community, desc: t.pages.about.values.communityDesc },
    { icon: Target, title: t.pages.about.values.excellence, desc: t.pages.about.values.excellenceDesc },
    { icon: Globe, title: t.pages.about.values.accessibility, desc: t.pages.about.values.accessibilityDesc },
  ];

  const team = [
    { name: t.pages.about.team.member1.name, role: t.pages.about.team.member1.role },
    { name: t.pages.about.team.member2.name, role: t.pages.about.team.member2.role },
    { name: t.pages.about.team.member3.name, role: t.pages.about.team.member3.role },
  ];

  return (
    <>
      <Helmet>
        <title>{t.pages.about.meta.title}</title>
        <meta name="description" content={t.pages.about.meta.description} />
        <link rel="canonical" href={`${baseUrl}/${language}/about`} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/about`} />
        <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar/about`} />
        <meta property="og:title" content={t.pages.about.meta.title} />
        <meta property="og:description" content={t.pages.about.meta.description} />
        <meta property="og:url" content={`${baseUrl}/${language}/about`} />
        <meta name="twitter:title" content={t.pages.about.meta.title} />
        <meta name="twitter:description" content={t.pages.about.meta.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: t.appName,
            url: baseUrl,
            description: t.pages.about.meta.description,
          })}
        </script>
      </Helmet>

      <div className="container py-12 md:py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pages.about.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pages.about.subtitle}
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.pages.about.mission.title}</h2>
              <p className="text-lg text-muted-foreground">
                {t.pages.about.mission.content}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.pages.about.valuesTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.pages.about.story.title}</h2>
            <div className="prose prose-lg dark:prose-invert">
              <p className="text-muted-foreground mb-4">{t.pages.about.story.p1}</p>
              <p className="text-muted-foreground mb-4">{t.pages.about.story.p2}</p>
              <p className="text-muted-foreground">{t.pages.about.story.p3}</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.pages.about.teamTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
