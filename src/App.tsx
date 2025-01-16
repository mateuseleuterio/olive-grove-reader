import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import Layout from "@/components/layout";
import Home from "@/pages/Home";
import ArticleEditor from "@/pages/ArticleEditor";
import ArticleView from "@/pages/ArticleView";
import ArticleEditPage from "@/pages/ArticleEditPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <SupabaseProvider>
          <AuthProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/article/new" element={<ArticleEditor />} />
                  <Route path="/article/:id" element={<ArticleView />} />
                  <Route path="/article/:id/edit" element={<ArticleEditPage />} />
                </Routes>
              </Layout>
            </Router>
          </AuthProvider>
        </SupabaseProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;