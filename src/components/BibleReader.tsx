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

interface Version {
  id: string;
  name: string;
}

const BibleReader = () => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Version[]>([
    { id: "ACF", name: "Almeida Corrigida Fiel" }
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('bible_books')
        .select('id, name')
        .order('position');

      if (error) {
        console.error('Erro ao buscar livros:', error);
        return;
      }

      setBooks(data || []);
      if (data && data.length > 0) {
        setSelectedBook(data[0].id);
      }
    };

    fetchBooks();
  }, []);

  const addVersion = () => {
    if (versions.length < 4) {
      setVersions([...versions, { id: "NVI", name: "Nova Versão Internacional" }]);
    }
  };

  const removeVersion = (index: number) => {
    const newVersions = versions.filter((_, i) => i !== index);
    setVersions(newVersions);
  };

  const handleVersionChange = (index: number, newVersion: string) => {
    const versionMap: { [key: string]: string } = {
      "ACF": "Almeida Corrigida Fiel",
      "NVI": "Nova Versão Internacional",
      "ARA": "Almeida Revista e Atualizada"
    };

    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { id: newVersion, name: versionMap[newVersion] || newVersion };
      }
      return v;
    });
    setVersions(newVersions);
  };

  const chapters = Array.from({ length: 50 }, (_, i) => (i + 1).toString());
  
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
                  onValueChange={(value) => handleVersionChange(index, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione a versão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACF">Almeida Corrigida Fiel</SelectItem>
                    <SelectItem value="NVI">Nova Versão Internacional</SelectItem>
                    <SelectItem value="ARA">Almeida Revista e Atualizada</SelectItem>
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
                      onValueChange={(value) => handleVersionChange(index, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a versão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACF">Almeida Corrigida Fiel</SelectItem>
                        <SelectItem value="NVI">Nova Versão Internacional</SelectItem>
                        <SelectItem value="ARA">Almeida Revista e Atualizada</SelectItem>
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

      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <CommentaryDrawer 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        currentPassage={{ book: selectedBook.toString(), chapter }}
      />
    </div>
  );
};

export default BibleReader;
