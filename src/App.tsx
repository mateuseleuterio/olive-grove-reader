import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 403 errors (unauthorized)
        if (error?.status === 403) return false;
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const ADMIN_UID = '5e475092-3de0-47b8-8543-c62450e07bbd';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  const clearSession = async () => {
    try {
      // First try to sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
      }

      // Clear all local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-rxhxhztskozxgiylygye-auth-token');
      
      // Clear query cache
      queryClient.clear();
      
      // Reset user state
      setCurrentUser(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const handleSessionError = async (error: any) => {
    console.error('Session error:', error);
    
    if (error.message.includes('session_not_found') || 
        error.message.includes('JWT expired') ||
        error.status === 403) {
      await clearSession();
      toast({
        title: "Sessão expirada",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          await handleSessionError(error);
          return;
        }

        if (!session?.user) {
          await clearSession();
          return;
        }

        setCurrentUser(session.user.id);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        await handleSessionError(error);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      try {
        switch (event) {
          case 'SIGNED_OUT':
            await clearSession();
            break;
          case 'SIGNED_IN':
            if (session?.user) {
              setCurrentUser(session.user.id);
            }
            break;
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              setCurrentUser(session.user.id);
            } else {
              await clearSession();
            }
            break;
          default:
            // Handle unknown events
            console.log('Unhandled auth event:', event);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        await handleSessionError(error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

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