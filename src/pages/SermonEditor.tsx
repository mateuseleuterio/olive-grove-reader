import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bold, Italic, List, Quote, Type, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const fetchBibleVerse = async (reference: string) => {
  try {
    // Remove parentheses from reference
    const cleanReference = reference.replace(/[()]/g, '').trim();
    
    // Split reference into book, chapter, and verse
    const [book, chapterVerse] = cleanReference.split(' ');
    const [chapter, verse] = chapterVerse.split(':');

    // Make API call to fetch verse
    const response = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/${book}/${chapter}/${verse}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar o versículo');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Erro ao buscar versículo:', error);
    throw new Error('Não foi possível carregar o versículo');
  }
};

const SermonEditor = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [verseReference, setVerseReference] = useState<string | null>(null);
  const { toast } = useToast();

  // Monitor content for Bible references
  useEffect(() => {
    const bibleReferenceRegex = /\(([\w\s]+\s\d+:\d+)\)/g;
    const match = content.match(bibleReferenceRegex);
    
    if (match) {
      const reference = match[0].slice(1, -1); // Remove parentheses
      setVerseReference(reference);
    }
  }, [content]);

  // Fetch verse when reference is found
  const { data: verseText, isError } = useQuery({
    queryKey: ['bibleVerse', verseReference],
    queryFn: () => fetchBibleVerse(verseReference || ''),
    enabled: !!verseReference,
    retry: 1,
    meta: {
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o versículo. Verifique se a referência está correta.",
          variant: "destructive"
        });
      }
    }
  });

  // Insert verse text when available
  useEffect(() => {
    if (verseText && verseReference) {
      const updatedContent = content.replace(
        `(${verseReference})`,
        `\n"${verseText}"\n(${verseReference})\n`
      );
      setContent(updatedContent);
      setVerseReference(null);
    }
  }, [verseText]);

  const applyFormat = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading':
        formattedText = `# ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <Card className="max-w-4xl mx-auto bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sermon-builder')}
            className="mr-2"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => applyFormat('bold')}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => applyFormat('italic')}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => applyFormat('heading')}
            title="Título"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => applyFormat('quote')}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => applyFormat('list')}
            title="Lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[500px] font-serif text-bible-text"
          placeholder="Digite seu sermão aqui... Para adicionar um versículo bíblico, use o formato: (Gênesis 1:1)"
        />
      </Card>
    </div>
  );
};

export default SermonEditor;