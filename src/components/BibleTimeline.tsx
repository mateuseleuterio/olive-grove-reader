import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineEvent {
  date: string;
  period: string;
  event: string;
  description: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "4000 AC",
    period: "Criação",
    event: "Criação do mundo",
    description: "Deus cria os céus, a terra e tudo que neles há em seis dias."
  },
  {
    date: "2348 AC",
    period: "Dilúvio",
    event: "O Grande Dilúvio",
    description: "Noé e sua família são salvos do dilúvio que cobre toda a terra."
  },
  {
    date: "2000 AC",
    period: "Era Patriarcal",
    event: "Chamado de Abraão",
    description: "Deus chama Abraão para deixar Ur dos Caldeus."
  },
  {
    date: "1446 AC",
    period: "Êxodo",
    event: "Saída do Egito",
    description: "Moisés lidera os israelitas para fora do Egito."
  },
  {
    date: "1406 AC",
    period: "Conquista",
    event: "Entrada em Canaã",
    description: "Josué lidera o povo na conquista da Terra Prometida."
  },
  {
    date: "1050 AC",
    period: "Monarquia",
    event: "Primeiro Rei",
    description: "Saul se torna o primeiro rei de Israel."
  },
  {
    date: "1010 AC",
    period: "Reino Unido",
    event: "Reinado de Davi",
    description: "Davi se torna rei e estabelece Jerusalém como capital."
  },
  {
    date: "970 AC",
    period: "Reino Unido",
    event: "Templo de Salomão",
    description: "Salomão constrói o primeiro templo em Jerusalém."
  },
  {
    date: "586 AC",
    period: "Exílio",
    event: "Cativeiro Babilônico",
    description: "Jerusalém é destruída e o povo é levado para a Babilônia."
  },
  {
    date: "538 AC",
    period: "Restauração",
    event: "Retorno do Exílio",
    description: "Primeiro grupo retorna a Jerusalém sob Zorobabel."
  },
  {
    date: "4 AC",
    period: "Era Messiânica",
    event: "Nascimento de Jesus",
    description: "Jesus Cristo nasce em Belém."
  },
  {
    date: "30 DC",
    period: "Era Messiânica",
    event: "Morte e Ressurreição",
    description: "Jesus é crucificado e ressuscita ao terceiro dia."
  }
];

const BibleTimeline = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold text-bible-navy mb-8">
        Linha do Tempo Bíblica
      </h1>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-bible-navy/20" />
          
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative flex items-start gap-8 group">
                {/* Date circle */}
                <div className="absolute left-16 w-4 h-4 -translate-x-1/2 rounded-full bg-bible-navy group-hover:scale-110 transition-transform" />
                
                {/* Date */}
                <div className="w-16 pt-1 text-right text-sm font-medium text-bible-navy">
                  {event.date}
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white rounded-lg shadow-sm p-4 ml-8 hover:shadow-md transition-shadow">
                  <div className="text-xs text-bible-verse font-medium uppercase tracking-wider mb-1">
                    {event.period}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-bible-navy mb-2">
                    {event.event}
                  </h3>
                  <p className="text-bible-text">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default BibleTimeline;