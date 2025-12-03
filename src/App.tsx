import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { autoImportBooksOnFirstRun } from "@/utils/autoImportBooks";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Library = lazy(() => import("./pages/Library"));
const ReadingPage = lazy(() => import("./pages/ReadingPage"));
const Discussions = lazy(() => import("./pages/Discussions"));
const DiscussionDetail = lazy(() => import("./pages/DiscussionDetail"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Vocabulary = lazy(() => import("./pages/Vocabulary"));
const AudioRooms = lazy(() => import("./pages/AudioRooms"));
const ExpertSessions = lazy(() => import("./pages/ExpertSessions"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const GDPR = lazy(() => import("./pages/GDPR"));
const SetupBooks = lazy(() => import("./pages/SetupBooks"));
const LiveReading = lazy(() => import("./pages/LiveReading"));
const BookClub = lazy(() => import("./pages/BookClub"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function AppContent() {
  // Auto-import books on first run
  useEffect(() => {
    autoImportBooksOnFirstRun().catch(console.error);
  }, []);

  return (
    <>
      <CookieConsent />
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/read/:bookId"
                element={
                  <ProtectedRoute>
                    <ReadingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book/:bookId"
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussions"
                element={
                  <ProtectedRoute>
                    <Discussions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussions/:id"
                element={
                  <ProtectedRoute>
                    <DiscussionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute>
                    <GroupDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert-sessions"
                element={
                  <ProtectedRoute>
                    <ExpertSessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-reading"
                element={
                  <ProtectedRoute>
                    <LiveReading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vocabulary"
                element={
                  <ProtectedRoute>
                    <Vocabulary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audio-rooms"
                element={
                  <ProtectedRoute>
                    <AudioRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audio-rooms/:roomId"
                element={
                  <ProtectedRoute>
                    <AudioRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-club"
                element={
                  <ProtectedRoute>
                    <BookClub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-club/:roomId"
                element={
                  <ProtectedRoute>
                    <BookClub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <ProtectedRoute>
                    <Privacy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/terms"
                element={
                  <ProtectedRoute>
                    <Terms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gdpr"
                element={
                  <ProtectedRoute>
                    <GDPR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setup-books"
                element={
                  <AdminRoute>
                    <SetupBooks />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
