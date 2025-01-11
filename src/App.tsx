import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SermonBuilder from "./pages/SermonBuilder";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sermon-builder" element={<SermonBuilder />} />
            {/* Other routes will be added here later */}
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;