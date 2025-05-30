import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Vida Cristã");
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");

  const categories = [
    "Vida Cristã",
    "Estudos Bíblicos",
    "Comunidade",
    "Adoração",
    "Evangelismo",
    "Família",
    "Teologia",
    "Devocional",
  ];

  const handleImageUpload = async (file: File, type: 'preview' | 'header') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article_images')
        .getPublicUrl(filePath);

      if (type === 'preview') {
        setPreviewImageUrl(publicUrl);
      } else {
        setHeaderImageUrl(publicUrl);
      }

      toast({
        title: "Sucesso!",
        description: "Imagem carregada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    }
  };

  const generateContent = async () => {
    if (!prompt) {
      toast({
        title: "Erro",
        description: "Por favor, insira um prompt para gerar o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: { prompt }
      });

      if (error) throw error;
      
      if (data.content) {
        setTitle(data.content.title || title);
        setDescription(data.content.description || description);
        setContent(data.content.content || content);
      }

      toast({
        title: "Sucesso!",
        description: "Conteúdo gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o conteúdo do artigo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user.id;

      if (!user_id) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um artigo.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("articles").insert({
        title,
        description,
        content,
        category,
        user_id,
        image_url: headerImageUrl || previewImageUrl,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Artigo criado com sucesso.",
      });
      
      navigate("/blog");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o artigo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold text-bible-navy mb-8">Criar Novo Artigo</h1>
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Gerador de Conteúdo AI</h2>
        <div className="space-y-4">
          <Textarea
            placeholder="Descreva o artigo que você quer gerar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="w-full bg-bible-navy hover:bg-bible-accent"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando conteúdo...
              </>
            ) : (
              "Gerar Conteúdo com AI"
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bible-text mb-2">
                Imagem de Preview
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewImage(file);
                      handleImageUpload(file, 'preview');
                    }
                  }}
                  className="flex-1"
                />
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bible-text mb-2">
                Imagem do Cabeçalho
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setHeaderImage(file);
                      handleImageUpload(file, 'header');
                    }
                  }}
                  className="flex-1"
                />
                {headerImageUrl && (
                  <img
                    src={headerImageUrl}
                    alt="Header"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-bible-text mb-2">
                Título
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-bible-text mb-2">
                Categoria
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-bible-text mb-2">
            Descrição
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-bible-text mb-2">
            Conteúdo
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[300px]"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/blog")}
            className="border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-bible-navy hover:bg-bible-accent"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Publicar Artigo"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;
