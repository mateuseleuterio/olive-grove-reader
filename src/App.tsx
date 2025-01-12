import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ArticleEditor from "@/pages/ArticleEditor";
import ArticleView from "@/pages/ArticleView";
import Index from "@/pages/Index";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new-article" element={<ArticleEditor />} />
      <Route path="/edit-article/:id" element={<ArticleEditor />} />
      <Route path="/article/:id" element={<ArticleView />} />
      <Route path="/index" element={<Index />} />
    </Routes>
  );
}

export default App;
