import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { BibleProvider } from "@/contexts/BibleContext";
import { HighlightProvider } from "@/contexts/HighlightContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { OriginalTextProvider } from "@/contexts/OriginalTextContext";
import { WordGroupProvider } from "@/contexts/WordGroupContext";
import { StrongsProvider } from "@/contexts/StrongsContext";
import { ReadingPlanProvider } from "@/contexts/ReadingPlanContext";
import { VerseSelectionProvider } from "@/contexts/VerseSelectionContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ChallengeProvider } from "@/contexts/ChallengeContext";
import { MentalMapProvider } from "@/contexts/MentalMapContext";
import { HistoricalEventsProvider } from "@/contexts/HistoricalEventsContext";
import { ArticleProvider } from "@/contexts/ArticleContext";
import Layout from "@/components/layout";
import Home from "@/pages/Home";
import Bible from "@/pages/Bible";
import BibleChapter from "@/pages/BibleChapter";
import ReadingPlan from "@/pages/ReadingPlan";
import ReadingPlanDetails from "@/pages/ReadingPlanDetails";
import ReadingPlanBuilder from "@/pages/ReadingPlanBuilder";
import SermonBuilder from "@/pages/SermonBuilder";
import SermonView from "@/pages/SermonView";
import DailyChallenge from "@/pages/DailyChallenge";
import GroupChallenge from "@/pages/GroupChallenge";
import MentalMap from "@/pages/MentalMap";
import MentalMapView from "@/pages/MentalMapView";
import HistoricalEvents from "@/pages/HistoricalEvents";
import Blog from "@/pages/Blog";
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
            <BibleProvider>
              <HighlightProvider>
                <NotesProvider>
                  <OriginalTextProvider>
                    <WordGroupProvider>
                      <StrongsProvider>
                        <ReadingPlanProvider>
                          <VerseSelectionProvider>
                            <LayoutProvider>
                              <SettingsProvider>
                                <ChallengeProvider>
                                  <MentalMapProvider>
                                    <HistoricalEventsProvider>
                                      <ArticleProvider>
                                        <Router>
                                          <Layout>
                                            <Routes>
                                              <Route path="/" element={<Home />} />
                                              <Route path="/bible" element={<Bible />} />
                                              <Route path="/bible/:book/:chapter" element={<BibleChapter />} />
                                              <Route path="/reading-plan" element={<ReadingPlan />} />
                                              <Route path="/reading-plan/:id" element={<ReadingPlanDetails />} />
                                              <Route path="/reading-plan-builder" element={<ReadingPlanBuilder />} />
                                              <Route path="/sermon-builder" element={<SermonBuilder />} />
                                              <Route path="/sermon/:id" element={<SermonView />} />
                                              <Route path="/daily-challenge" element={<DailyChallenge />} />
                                              <Route path="/group-challenge" element={<GroupChallenge />} />
                                              <Route path="/mental-map" element={<MentalMap />} />
                                              <Route path="/mental-map/:id" element={<MentalMapView />} />
                                              <Route path="/historical-events" element={<HistoricalEvents />} />
                                              <Route path="/blog" element={<Blog />} />
                                              <Route path="/article/new" element={<ArticleEditor />} />
                                              <Route path="/article/:id" element={<ArticleView />} />
                                              <Route path="/article/:id/edit" element={<ArticleEditPage />} />
                                            </Routes>
                                          </Layout>
                                        </Router>
                                      </ArticleProvider>
                                    </HistoricalEventsProvider>
                                  </MentalMapProvider>
                                </ChallengeProvider>
                              </SettingsProvider>
                            </LayoutProvider>
                          </VerseSelectionProvider>
                        </ReadingPlanProvider>
                      </StrongsProvider>
                    </WordGroupProvider>
                  </OriginalTextProvider>
                </NotesProvider>
              </HighlightProvider>
            </BibleProvider>
          </AuthProvider>
        </SupabaseProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;