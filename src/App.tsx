import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BibleReader from "./components/BibleReader";
import SermonBuilder from "./pages/SermonBuilder";
import SermonEditor from "./pages/SermonEditor";
import PreachingMode from "./pages/PreachingMode";
import BibleChallenge from "./pages/BibleChallenge";
import ArticleView from "./pages/ArticleView";
import ArticleEditor from "./pages/ArticleEditor";
import Study from "./pages/Study";
import StudyCategory from "./pages/StudyCategory";
import ReadingPlans from "./pages/ReadingPlans";
import MentalMaps from "./pages/MentalMaps";
import CreateMentalMap from "./pages/CreateMentalMap";
import Settings from "./pages/Settings";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-bible-gray">
            <NavigationBar />
            <div className="pt-24 px-4 md:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/bible" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/blog" element={<Home />} />
                <Route path="/bible" element={<BibleReader />} />
                <Route path="/sermon-builder" element={
                  <ProtectedRoute>
                    <SermonBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/sermon-editor/:id" element={
                  <ProtectedRoute>
                    <SermonEditor />
                  </ProtectedRoute>
                } />
                <Route path="/sermon-editor/:type" element={
                  <ProtectedRoute>
                    <SermonEditor />
                  </ProtectedRoute>
                } />
                <Route path="/preaching-mode/:id" element={
                  <ProtectedRoute>
                    <PreachingMode />
                  </ProtectedRoute>
                } />
                <Route path="/bible-challenge" element={<BibleChallenge />} />
                <Route path="/article/:id" element={<ArticleView />} />
                <Route path="/new-article" element={
                  <ProtectedRoute>
                    <ArticleEditor />
                  </ProtectedRoute>
                } />
                <Route path="/study" element={<Study />} />
                <Route path="/study/:category" element={<StudyCategory />} />
                <Route path="/reading-plans" element={<ReadingPlans />} />
                <Route path="/mental-maps" element={
                  <ProtectedRoute>
                    <MentalMaps />
                  </ProtectedRoute>
                } />
                <Route path="/mental-maps/new" element={
                  <ProtectedRoute>
                    <CreateMentalMap />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;