import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  type: "biblical" | "historical";
}

const timelineEvents: TimelineEvent[] = [
  {
    year: -3000,
    title: "Início da Civilização Suméria",
    description: "Desenvolvimento da escrita cuneiforme e primeiras cidades-estado.",
    type: "historical"
  },
  {
    year: -2000,
    title: "Abraão em Ur",
    description: "Período aproximado de Abraão deixando Ur dos Caldeus.",
    type: "biblical"
  },
  {
    year: -1500,
    title: "Novo Reino do Egito",
    description: "Auge do poder egípcio, período provável do Êxodo.",
    type: "historical"
  },
  {
    year: -1200,
    title: "Guerra de Troia",
    description: "Período aproximado da Guerra de Troia descrita por Homero.",
    type: "historical"
  },
  {
    year: -1000,
    title: "Reino de Davi",
    description: "Estabelecimento de Jerusalém como capital.",
    type: "biblical"
  },
  {
    year: -776,
    title: "Primeiros Jogos Olímpicos",
    description: "Início dos Jogos Olímpicos na Grécia Antiga.",
    type: "historical"
  },
  {
    year: -586,
    title: "Queda de Jerusalém",
    description: "Destruição do Primeiro Templo por Nabucodonosor.",
    type: "biblical"
  },
  {
    year: -500,
    title: "Império Persa",
    description: "Auge do Império Persa sob Dario I.",
    type: "historical"
  },
  {
    year: -332,
    title: "Alexandre, o Grande",
    description: "Conquista da Pérsia e expansão do helenismo.",
    type: "historical"
  },
  {
    year: -63,
    title: "Roma na Judeia",
    description: "Pompeu conquista Jerusalém para Roma.",
    type: "biblical"
  },
  {
    year: 0,
    title: "Nascimento de Jesus",
    description: "Início da Era Cristã.",
    type: "biblical"
  },
  {
    year: 79,
    title: "Destruição de Pompeia",
    description: "Erupção do Monte Vesúvio destrói Pompeia.",
    type: "historical"
  }
];

const Timeline = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [centerIndex, setCenterIndex] = useState(Math.floor(timelineEvents.length / 2));

  const handlePrevious = () => {
    if (centerIndex > 0) {
      setCenterIndex(centerIndex - 1);
    }
  };

  const handleNext = () => {
    if (centerIndex < timelineEvents.length - 1) {
      setCenterIndex(centerIndex + 1);
    }
  };

  return (
    <div className="w-full py-8">
      <h2 className="text-3xl font-bold text-bible-navy mb-6">Linha do Tempo Histórica</h2>
      
      <div className="relative">
        <button 
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          disabled={centerIndex === 0}
        >
          <ChevronLeft className="h-6 w-6 text-bible-navy" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          disabled={centerIndex === timelineEvents.length - 1}
        >
          <ChevronRight className="h-6 w-6 text-bible-navy" />
        </button>

        <ScrollArea className="w-full overflow-hidden">
          <div className="flex items-center justify-start gap-4 py-8 px-12 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-bible-accent" />
            
            {timelineEvents.map((event, index) => (
              <div
                key={event.year}
                className={cn(
                  "flex flex-col items-center transition-all duration-300 group",
                  Math.abs(index - centerIndex) <= 2 ? "opacity-100" : "opacity-40"
                )}
                style={{
                  transform: `scale(${1 - Math.abs(index - centerIndex) * 0.1})`,
                }}
              >
                {/* Event dot and preview card */}
                <div className="relative mb-4">
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-full cursor-pointer transition-colors z-10 relative",
                      event.type === "biblical" ? "bg-bible-navy" : "bg-bible-accent",
                      selectedEvent?.year === event.year ? "ring-4 ring-bible-accent ring-opacity-50" : ""
                    )}
                    onClick={() => setSelectedEvent(event)}
                  />
                  
                  {/* Preview card */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Card className="w-48 transform -translate-x-1/2 left-1/2 relative">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium mb-1">{event.title}</p>
                        <span className="text-xs text-bible-verse">
                          {event.year < 0 ? `${Math.abs(event.year)} AC` : `${event.year} DC`}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Year label */}
                <span className="text-sm font-medium -rotate-45 whitespace-nowrap mt-2">
                  {event.year < 0 ? `${Math.abs(event.year)} AC` : `${event.year} DC`}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Detailed event card */}
      {selectedEvent && (
        <Card className="mt-8 max-w-2xl mx-auto animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-bible-accent" />
              <span className="font-medium">
                {selectedEvent.year < 0 ? `${Math.abs(selectedEvent.year)} AC` : `${selectedEvent.year} DC`}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-bible-navy mb-2">{selectedEvent.title}</h3>
            <p className="text-bible-text">{selectedEvent.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-bible-navy" />
          <span className="text-sm">Eventos Bíblicos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-bible-accent" />
          <span className="text-sm">Eventos Históricos</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;