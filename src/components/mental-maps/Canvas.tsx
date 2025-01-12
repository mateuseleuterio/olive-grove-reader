import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Text } from "fabric";
import { Button } from "@/components/ui/button";
import { Brain, Circle as CircleIcon, Square, Type } from "lucide-react";

interface CanvasProps {
  onSave: (content: string) => void;
}

export const Canvas = ({ onSave }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const addShape = (type: "circle" | "rectangle" | "text") => {
    if (!canvas) return;

    switch (type) {
      case "circle":
        const circle = new Circle({
          radius: 30,
          fill: "#fff",
          stroke: "#000",
          left: 100,
          top: 100,
        });
        canvas.add(circle);
        break;
      case "rectangle":
        const rect = new Rect({
          width: 60,
          height: 60,
          fill: "#fff",
          stroke: "#000",
          left: 100,
          top: 100,
        });
        canvas.add(rect);
        break;
      case "text":
        const text = new Text("Texto", {
          left: 100,
          top: 100,
          fontSize: 16,
        });
        canvas.add(text);
        break;
    }
    canvas.renderAll();
  };

  const handleSave = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    onSave(JSON.stringify(json));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => addShape("circle")}
          size="icon"
        >
          <CircleIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => addShape("rectangle")}
          size="icon"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => addShape("text")}
          size="icon"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} />
      </div>

      <Button type="button" onClick={handleSave} className="w-full">
        <Brain className="mr-2 h-4 w-4" />
        Finalizar Mapa Mental
      </Button>
    </div>
  );
};