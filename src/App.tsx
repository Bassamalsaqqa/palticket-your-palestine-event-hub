import { Helmet, HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n";
import { PublicLayout } from "@/components/PublicLayout";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import EventDetailPage from "./pages/EventDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Helmet>
            <meta name="theme-color" content="hsl(40, 33%, 98%)" />
            <meta name="description" content="PalTicket - Your Gateway to Unforgettable Events in Palestine. Discover and book tickets to concerts, festivals, sports, and cultural events." />
            <meta property="og:title" content="PalTicket - تذاكر فلسطين" />
            <meta property="og:description" content="Discover and book tickets to the most exciting events across Palestine." />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="alternate" hrefLang="en" href="/en" />
            <link rel="alternate" hrefLang="ar" href="/ar" />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to English */}
              <Route path="/" element={<Navigate to="/en" replace />} />
              
              {/* English Routes */}
              <Route path="/en" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="events/:slug" element={<EventDetailPage />} />
              </Route>
              
              {/* Arabic Routes */}
              <Route path="/ar" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="events/:slug" element={<EventDetailPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
