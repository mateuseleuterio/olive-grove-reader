import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-bible-gray flex flex-col">
            <NavigationBar />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 w-full max-w-7xl">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bible" element={<BibleReader />} />
                <Route path="/sermon-builder" element={<SermonBuilder />} />
                <Route path="/sermon-editor/:id" element={<SermonEditor />} />
                <Route path="/sermon-editor/:type" element={<SermonEditor />} />
                <Route path="/preaching-mode/:id" element={<PreachingMode />} />
                <Route path="/bible-challenge" element={<BibleChallenge />} />
                <Route path="/article/:id" element={<ArticleView />} />
                <Route path="/new-article" element={<ArticleEditor />} />
                <Route path="/study" element={<Study />} />
                <Route path="/study/:category" element={<StudyCategory />} />
                <Route path="/reading-plans" element={<ReadingPlans />} />
                <Route path="/mental-maps" element={<MentalMaps />} />
                <Route path="/mental-maps/new" element={<CreateMentalMap />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;