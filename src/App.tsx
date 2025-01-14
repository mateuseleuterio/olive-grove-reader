import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
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
import Login from "./pages/Login";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

const ADMIN_UID = '5e475092-3de0-47b8-8543-c62450e07bbd';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user?.id || null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (currentUser !== ADMIN_UID) {
      return <ComingSoon />;
    }
    return <>{children}</>;
  };

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
                <Route path="/sermon-builder" element={<SermonBuilder />} />
                <Route path="/sermon-editor" element={<SermonEditor />} />
                <Route path="/preaching-mode/:id" element={<PreachingMode />} />
                <Route 
                  path="/bible-challenge" 
                  element={
                    <ProtectedRoute>
                      <BibleChallenge />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/article/:id" element={<ArticleView />} />
                <Route path="/new-article" element={<ArticleEditor />} />
                <Route 
                  path="/study" 
                  element={
                    <ProtectedRoute>
                      <Study />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/study/:category" 
                  element={
                    <ProtectedRoute>
                      <StudyCategory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reading-plans" 
                  element={
                    <ProtectedRoute>
                      <ReadingPlans />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mental-maps" 
                  element={
                    <ProtectedRoute>
                      <MentalMaps />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mental-maps/new" 
                  element={
                    <ProtectedRoute>
                      <CreateMentalMap />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;