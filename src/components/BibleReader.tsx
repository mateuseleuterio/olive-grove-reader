import { useState } from "react";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import WordDetails from "./WordDetails";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BibleReader = () => {
  const [version, setVersion] = useState("almeida");
  const [book, setBook] = useState("genesis");
  const [chapter, setChapter] = useState("1");
  
  const renderVerse = (text: string) => {
    return text.split(" ").map((word, index) => (
      <WordDetails key={index} word={word} />
    ));
  };

  // Sample data - in a real app this would come from an API
  const books = [
    { id: "genesis", name: "Gênesis" },
    { id: "exodus", name: "Êxodo" },
    { id: "leviticus", name: "Levítico" },
    { id: "numbers", name: "Números" },
    { id: "deuteronomy", name: "Deuteronômio" },
    { id: "joshua", name: "Josué" },
    { id: "judges", name: "Juízes" },
    { id: "ruth", name: "Rute" },
    { id: "1-samuel", name: "1 Samuel" },
    { id: "2-samuel", name: "2 Samuel" },
    { id: "1-kings", name: "1 Reis" },
    { id: "2-kings", name: "2 Reis" },
    { id: "1-chronicles", name: "1 Crônicas" },
    { id: "2-chronicles", name: "2 Crônicas" },
    { id: "ezra", name: "Esdras" },
    { id: "nehemiah", name: "Neemias" },
    { id: "esther", name: "Ester" },
    { id: "job", name: "Jó" },
    { id: "psalms", name: "Salmos" },
    { id: "proverbs", name: "Provérbios" },
    { id: "ecclesiastes", name: "Eclesiastes" },
    { id: "song-of-solomon", name: "Cântico dos Cânticos" },
    { id: "isaiah", name: "Isaías" },
    { id: "jeremiah", name: "Jeremias" },
    { id: "lamentations", name: "Lamentações" },
    { id: "ezekiel", name: "Ezequiel" },
    { id: "daniel", name: "Daniel" },
    { id: "hosea", name: "Oséias" },
    { id: "joel", name: "Joel" },
    { id: "amos", name: "Amós" },
    { id: "obadiah", name: "Obadias" },
    { id: "jonah", name: "Jonas" },
    { id: "micah", name: "Miquéias" },
    { id: "nahum", name: "Naum" },
    { id: "habakkuk", name: "Habacuque" },
    { id: "zephaniah", name: "Sofonias" },
    { id: "haggai", name: "Ageu" },
    { id: "zechariah", name: "Zacarias" },
    { id: "malachi", name: "Malaquias" },
  ];

  const chapters = Array.from({ length: 50 }, (_, i) => (i + 1).toString());
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Select value={book} onValueChange={setBook}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o livro" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {books.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
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
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="almeida">Almeida</SelectItem>
              <SelectItem value="nvi">Nova Versão Internacional</SelectItem>
              <SelectItem value="ara">Almeida Revista e Atualizada</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Book className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bible-text space-y-6 bg-white rounded-lg p-4 md:p-8 shadow-sm">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-bible-navy mb-6 break-words">
          A criação dos céus e da terra e de tudo o que neles há
        </h2>
        <div className="space-y-4">
          <p className="break-words">
            <span className="verse-number">1</span>
            {renderVerse("No princípio criou Deus os céus e a terra")}
          </p>
          <p className="break-words">
            <span className="verse-number">2</span>
            {renderVerse("A terra porém estava sem forma e vazia havia trevas sobre a face do abismo e o Espírito de Deus pairava por sobre as águas")}
          </p>
          <p className="break-words">
            <span className="verse-number">3</span>
            {renderVerse("Disse Deus Haja luz E houve luz")}
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default BibleReader;
