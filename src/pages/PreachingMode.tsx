import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit2, Clock } from "lucide-react";

const PreachingMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const { content, returnPath } = location.state || { content: "", returnPath: "/sermon-builder" };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleEdit = () => {
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-bible-gray p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-serif text-bible-navy">
            Modo Pregação
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="h-5 w-5 text-bible-navy" />
              <span className="font-mono text-lg text-bible-navy">
                {formatTime(time)}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
              className="text-bible-navy hover:bg-bible-gray/10"
            >
              {isRunning ? "Pausar" : "Continuar"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleEdit}
              className="text-bible-navy hover:bg-bible-gray/10"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div 
            className="prose max-w-none font-serif"
            dangerouslySetInnerHTML={{ 
              __html: content
                .split('\n')
                .map(line => {
                  if (line.startsWith('# ')) {
                    return `<h1 class="text-3xl font-bold text-bible-navy mb-6">${line.slice(2)}</h1>`;
                  } else if (line.startsWith('## ')) {
                    return `<h2 class="text-2xl font-semibold text-bible-navy mt-8 mb-4">${line.slice(3)}</h2>`;
                  } else if (line.startsWith('### ')) {
                    return `<h3 class="text-xl font-medium text-bible-navy mt-6 mb-3">${line.slice(4)}</h3>`;
                  } else if (line.startsWith('- ')) {
                    return `<li class="ml-4 mb-2">${line.slice(2)}</li>`;
                  } else if (line.trim() === '') {
                    return '<br>';
                  } else {
                    return `<p class="text-bible-text leading-relaxed mb-4">${line}</p>`;
                  }
                })
                .join('\n')
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default PreachingMode;