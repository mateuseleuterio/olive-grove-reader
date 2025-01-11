import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SermonBuilder from "./pages/SermonBuilder";
import SermonEditor from "./pages/SermonEditor";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sermon-builder" element={<SermonBuilder />} />
            <Route path="/sermon-editor/:type" element={<SermonEditor />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;