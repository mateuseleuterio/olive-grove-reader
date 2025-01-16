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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Vida Cristã");
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [idea, setIdea] = useState("");

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

  const generateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-image', {
        body: { prompt },
      });

      if (error) throw error;

      if (data.imageUrl) {
        const response = await fetch(data.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        
        await handleImageUpload(file, 'header');
      }

      toast({
        title: "Sucesso!",
        description: "Imagem gerada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar a imagem. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateContent = async () => {
    if (!idea) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma ideia para gerar o artigo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: { prompt: idea }
      });

      if (error) throw error;
      
      if (data.content) {
        setTitle(data.content.title || title);
        setDescription(data.content.description || description);
        setContent(data.content.content || content);
        setCategory(data.content.category || category);
        
        await generateImage(data.content.title || idea);
      }

      toast({
        title: "Sucesso!",
        description: "Artigo e imagem gerados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o artigo. Por favor, tente novamente.",
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para publicar um artigo.",
          variant: "destructive",
        });
        return;
      }

      const articleData = {
        title,
        description,
        content,
        category,
        image_url: headerImageUrl || previewImageUrl,
        user_id: userData.user.id
      };

      const { error: insertError } = await supabase
        .from('articles')
        .insert([articleData]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: "Artigo publicado com sucesso.",
      });

      navigate("/blog");
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({
        title: "Erro",
        description: "Erro ao publicar o artigo. Por favor, tente novamente.",
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
        <h2 className="text-xl font-semibold mb-4">Gerador de Artigo com IA</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bible-text mb-2">
              Sua Ideia
            </label>
            <Textarea
              placeholder="Descreva sua ideia para o artigo..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button
            onClick={generateContent}
            disabled={isGenerating || isGeneratingImage}
            className="w-full bg-bible-navy hover:bg-bible-accent"
          >
            {(isGenerating || isGeneratingImage) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingImage ? "Gerando imagem..." : "Gerando artigo..."}
              </>
            ) : (
              "Gerar Artigo e Imagem com IA"
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
                Publicando...
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
