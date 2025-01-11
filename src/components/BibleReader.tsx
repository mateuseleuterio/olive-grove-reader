import { useState } from "react";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BibleReader = () => {
  const [version, setVersion] = useState("almeida");
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-bible-navy text-xl font-semibold">Gênesis 1</h1>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
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
      
      <div className="bible-text space-y-6 bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-bible-navy mb-6">
          A criação dos céus e da terra e de tudo o que neles há
        </h2>
        <p>
          <span className="verse-number">1</span>
          No princípio, criou Deus os céus e a terra.
        </p>
        <p>
          <span className="verse-number">2</span>
          A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.
        </p>
        <p>
          <span className="verse-number">3</span>
          Disse Deus: Haja luz. E houve luz.
        </p>
      </div>
    </div>
  );
};

export default BibleReader;