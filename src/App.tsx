import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import BibleReader from "./components/BibleReader";
import SermonBuilder from "./pages/SermonBuilder";
import SermonEditor from "./pages/SermonEditor";
import BibleChallenge from "./pages/BibleChallenge";
import ArticleView from "./pages/ArticleView";
import ArticleEditor from "./pages/ArticleEditor";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-bible-gray">
            <NavigationBar />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bible" element={<BibleReader />} />
                <Route path="/sermon-builder" element={<SermonBuilder />} />
                <Route path="/sermon-editor/:type" element={<SermonEditor />} />
                <Route path="/bible-challenge" element={<BibleChallenge />} />
                <Route path="/article/:id" element={<ArticleView />} />
                <Route path="/new-article" element={<ArticleEditor />} />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;