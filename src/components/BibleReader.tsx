import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Book, BookOpen, Plus, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleVerse from "./BibleVerse";
import { supabase } from "@/integrations/supabase/client";

interface Book {
  id: number;
  name: string;
}

const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "NVI": "Nova Versão Internacional",
  "ARA": "Almeida Revista e Atualizada"
} as const;

type BibleVersion = keyof typeof BIBLE_VERSIONS;

const BibleReader = () => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([
    { id: "ACF", name: BIBLE_VERSIONS.ACF }
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [maxChapters, setMaxChapters] = useState(50); // Valor padrão

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('bible_books')
        .select('id, name')
        .order('position');

      if (error) {
        console.error('Erro ao buscar livros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de livros.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setBooks(data);
        if (data.length > 0) {
          setSelectedBook(data[0].id);
        }
      }
    };

    fetchBooks();
  }, [toast]);

  // Buscar o número máximo de capítulos para o livro selecionado
  useEffect(() => {
    const fetchChapterCount = async () => {
      const { data, error } = await supabase
        .from('bible_chapters')
        .select('chapter_number')
        .eq('book_id', selectedBook)
        .order('chapter_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar número de capítulos:', error);
        return;
      }

      if (data && data.length > 0) {
        setMaxChapters(data[0].chapter_number);
        // Resetar para capítulo 1 quando mudar de livro
        setChapter("1");
      }
    };

    if (selectedBook) {
      fetchChapterCount();
    }
  }, [selectedBook]);

  const addVersion = () => {
    if (versions.length < 4) {
      // Encontrar uma versão que ainda não está sendo usada
      const unusedVersion = (Object.entries(BIBLE_VERSIONS) as [BibleVersion, string][])
        .find(([id]) => !versions.some(v => v.id === id));
      
      if (unusedVersion) {
        setVersions([...versions, { id: unusedVersion[0], name: unusedVersion[1] }]);
      }
    }
  };

  const removeVersion = (index: number) => {
    const newVersions = versions.filter((_, i) => i !== index);
    setVersions(newVersions);
  };

  const handleVersionChange = (index: number, newVersion: BibleVersion) => {
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { id: newVersion, name: BIBLE_VERSIONS[newVersion] };
      }
      return v;
    });
    setVersions(newVersions);
  };

  const chapters = Array.from({ length: maxChapters }, (_, i) => (i + 1).toString());
  
  const importBible = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('import-github-bible');
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "A importação da Bíblia foi iniciada com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro ao importar bíblia:', error);
      toast({
        title: "Erro",
        description: "Houve um erro ao importar a Bíblia. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Select value={selectedBook.toString()} onValueChange={(value) => setSelectedBook(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o livro" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Select value={chapter} onValueChange={setChapter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Capítulo" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {chapters.map((c) => (
                  <SelectItem key={c} value={c}>
                    Capítulo {c}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={importBible}
            className="relative"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={addVersion}
            disabled={versions.length >= 4}
            className="relative"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsCommentaryOpen(true)}
            className="relative"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {versions.map((version, index) => (
            <div key={`mobile-panel-${index}`} className="border rounded-lg bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <Select 
                  value={version.id} 
                  onValueChange={(value) => handleVersionChange(index, value as BibleVersion)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione a versão" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BIBLE_VERSIONS).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {versions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVersion(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="bible-text space-y-6 p-4 md:p-8">
                <BibleVerse 
                  bookId={selectedBook}
                  chapter={chapter}
                  version={version.id}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ResizablePanelGroup 
          direction="horizontal" 
          className="min-h-[400px] w-full rounded-lg border"
        >
          {versions.map((version, index) => (
            <>
              <ResizablePanel key={`panel-${index}`} defaultSize={100 / versions.length}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b bg-white">
                    <Select 
                      value={version.id} 
                      onValueChange={(value) => handleVersionChange(index, value as BibleVersion)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a versão" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BIBLE_VERSIONS).map(([id, name]) => (
                          <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {versions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVersion(index)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="bible-text space-y-6 bg-white p-4 md:p-8 flex-1 overflow-y-auto">
                    <BibleVerse 
                      bookId={selectedBook}
                      chapter={chapter}
                      version={version.id}
                    />
                  </div>
                </div>
              </ResizablePanel>
              {index < versions.length - 1 && (
                <ResizableHandle withHandle />
              )}
            </>
          ))}
        </ResizablePanelGroup>
      )}

      <CommentaryDrawer 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        currentPassage={{ book: selectedBook.toString(), chapter }}
      />
    </div>
  );
};

export default BibleReader;
