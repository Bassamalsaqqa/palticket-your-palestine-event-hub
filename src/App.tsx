import { Helmet, HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n";
import { AuthProvider } from "@/contexts";
import { PublicLayout } from "@/components/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import EventDetailPage from "./pages/EventDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DesignGuidelinesPage from "./pages/DesignGuidelinesPage";
import PartnerPage from "./pages/PartnerPage";
import PastEventsPage from "./pages/PastEventsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountPage from "./pages/AccountPage";
import ScannerPage from "./pages/ScannerPage";
import NotFound from "./pages/NotFound";
import { RequireAdmin, RequireStaff } from "@/components/RouteGuards";
import {
  AdminDashboard,
  AdminEvents,
  AdminTicketTypes,
  AdminOrders,
  AdminTickets,
  AdminUsers,
  AdminRoles,
  AdminGates,
  AdminStaff,
  AdminExports,
  AdminAuditLogs,
  AdminSettings,
} from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
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
                <Route path="/" element={<Navigate to="/en" replace />} />
                
                {/* English Routes */}
                <Route path="/en" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="discover" element={<DiscoverPage />} />
                  <Route path="events/:slug" element={<EventDetailPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="design-guidelines" element={<DesignGuidelinesPage />} />
                  <Route path="partner" element={<PartnerPage />} />
                  <Route path="past-events" element={<PastEventsPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="account" element={<AccountPage />} />
                </Route>

                {/* English Scanner Route */}
                <Route element={<RequireStaff />}>
                  <Route path="/en/scan" element={<ScannerPage />} />
                </Route>

                {/* English Admin Routes */}
                <Route element={<RequireAdmin />}>
                  <Route path="/en/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="ticket-types" element={<AdminTicketTypes />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="gates" element={<AdminGates />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="exports" element={<AdminExports />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>
                
                {/* Arabic Routes */}
                <Route path="/ar" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="discover" element={<DiscoverPage />} />
                  <Route path="events/:slug" element={<EventDetailPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="design-guidelines" element={<DesignGuidelinesPage />} />
                  <Route path="partner" element={<PartnerPage />} />
                  <Route path="past-events" element={<PastEventsPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="account" element={<AccountPage />} />
                </Route>

                {/* Arabic Scanner Route */}
                <Route element={<RequireStaff />}>
                  <Route path="/ar/scan" element={<ScannerPage />} />
                </Route>

                {/* Arabic Admin Routes */}
                <Route element={<RequireAdmin />}>
                  <Route path="/ar/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="ticket-types" element={<AdminTicketTypes />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="gates" element={<AdminGates />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="exports" element={<AdminExports />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
