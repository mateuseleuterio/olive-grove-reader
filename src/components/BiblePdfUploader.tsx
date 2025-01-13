import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function BiblePdfUploader() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo PDF",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('version', 'ARA'); // Versão fixa como ARA pois será usada como referência

      const { data, error } = await supabase.functions.invoke('upload-bible-pdf', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "PDF enviado com sucesso",
      });

      // Limpar input
      event.target.value = '';
    } catch (error) {
      console.error('Erro ao enviar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar PDF ARA'
        )}
      </label>
    </div>
  );
}