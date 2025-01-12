import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description: string;
}

interface UnsplashImageSelectorProps {
  onSelect: (imageUrl: string) => void;
}

const UnsplashImageSelector = ({ onSelect }: UnsplashImageSelectorProps) => {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=20`,
        {
          headers: {
            Authorization: "Client-ID YOUR_UNSPLASH_ACCESS_KEY",
          },
        }
      );
      const data = await response.json();
      setImages(data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ImagePlus className="mr-2 h-4 w-4" />
          Escolher imagem do Unsplash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolher imagem do Unsplash</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Buscar imagens..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchImages()}
          />
          <Button onClick={searchImages} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-video cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelect(image.urls.regular)}
            >
              <img
                src={image.urls.thumb}
                alt={image.alt_description}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnsplashImageSelector;