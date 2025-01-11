import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bold, Italic, List, Quote, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const fetchBibleVerse = async (reference: string) => {
  // This is a mock function - in a real app, you would call your Bible API
  // Format: "Genesis 1:1" -> returns the verse text
  return "No princípio criou Deus o céu e a terra.";
};

const SermonEditor = () => {
  const { type } = useParams();
  const [content, setContent] = useState("");
  const [verseReference, setVerseReference] = useState<string | null>(null);

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
  const { data: verseText } = useQuery({
    queryKey: ['bibleVerse', verseReference],
    queryFn: () => fetchBibleVerse(verseReference || ''),
    enabled: !!verseReference,
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
        <div className="flex gap-2 mb-4">
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