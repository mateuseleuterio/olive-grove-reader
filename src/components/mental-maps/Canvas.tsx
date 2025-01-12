import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Text, Line } from "fabric";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Circle as CircleIcon,
  Square,
  Type,
  ArrowRight,
  Palette,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CanvasProps {
  onSave: (content: string) => void;
}

export const Canvas = ({ onSave }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    fabricCanvas.on("mouse:down", (options) => {
      if (isDrawingArrow && !arrowStart) {
        const pointer = fabricCanvas.getPointer(options.e);
        setArrowStart({ x: pointer.x, y: pointer.y });
      }
    });

    fabricCanvas.on("mouse:up", (options) => {
      if (isDrawingArrow && arrowStart) {
        const pointer = fabricCanvas.getPointer(options.e);
        createArrow(arrowStart.x, arrowStart.y, pointer.x, pointer.y);
        setArrowStart(null);
      }
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const createArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
    if (!canvas) return;

    const line = new Line([fromX, fromY, toX, toY], {
      stroke: activeColor,
      strokeWidth: 2,
      selectable: true,
    });

    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLength = 15;

    const arrowHead = new Path2D();
    arrowHead.moveTo(toX, toY);
    arrowHead.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    arrowHead.moveTo(toX, toY);
    arrowHead.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );

    canvas.add(line);
    canvas.renderAll();
  };

  const addShape = (type: "circle" | "rectangle" | "text") => {
    if (!canvas) return;

    switch (type) {
      case "circle":
        const circle = new Circle({
          radius: 30,
          fill: "#fff",
          stroke: activeColor,
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
          stroke: activeColor,
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
          fill: activeColor,
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
        <Button
          type="button"
          variant={isDrawingArrow ? "default" : "outline"}
          onClick={() => setIsDrawingArrow(!isDrawingArrow)}
          size="icon"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-6 gap-2">
              {[
                "#000000",
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFFF00",
                "#FF00FF",
                "#00FFFF",
                "#808080",
                "#800000",
                "#008000",
                "#000080",
                "#808000",
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
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