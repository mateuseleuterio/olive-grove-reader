import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data for presentation
const SAMPLE_CHALLENGE = {
  id: "1",
  title: "Conhecimentos sobre o Livro de Gênesis",
  date: new Date().toISOString(),
  questions: [
    {
      id: "q1",
      question: "Quem construiu a arca?",
      correctAnswer: "Noé",
      wrongAnswers: ["Moisés", "Abraão", "Davi"]
    },
    {
      id: "q2",
      question: "Quantos dias e noites choveu durante o dilúvio?",
      correctAnswer: "40",
      wrongAnswers: ["7", "30", "100"]
    }
  ]
};

const SAMPLE_SCORES = [
  { id: "1", userName: "João Silva", score: 95, completedAt: new Date().toISOString() },
  { id: "2", userName: "Maria Santos", score: 85, completedAt: new Date().toISOString() },
  { id: "3", userName: "Pedro Oliveira", score: 75, completedAt: new Date().toISOString() },
  { id: "4", userName: "Ana Souza", score: 70, completedAt: new Date().toISOString() },
  { id: "5", userName: "Lucas Ferreira", score: 65, completedAt: new Date().toISOString() }
];

const BibleChallenge = () => {
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);

  const handleStartChallenge = () => {
    setIsStarted(true);
    toast({
      title: "Desafio iniciado!",
      description: "Boa sorte em seu desafio bíblico.",
    });
  };

  const handleCreateGroupChallenge = () => {
    toast({
      title: "Em breve!",
      description: "A funcionalidade de desafios em grupo estará disponível em breve.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Challenge Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-bible-navy" />
              Desafio Diário
            </CardTitle>
            <CardDescription>
              Teste seus conhecimentos bíblicos no desafio de hoje!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">{SAMPLE_CHALLENGE.title}</h3>
            <div className="space-y-4 mb-6">
              <p className="text-bible-text">
                Este desafio contém {SAMPLE_CHALLENGE.questions.length} questões sobre o Livro de Gênesis.
                Teste seu conhecimento e compare sua pontuação com outros participantes!
              </p>
            </div>
            <Button
              onClick={handleStartChallenge}
              className="w-full bg-bible-navy hover:bg-bible-accent"
              disabled={isStarted}
            >
              {isStarted ? "Desafio em Andamento" : "Começar Desafio"}
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-bible-navy" />
              Ranking
            </CardTitle>
            <CardDescription>Top 5 jogadores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SAMPLE_SCORES.map((score, index) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-bible-navy">{index + 1}º</span>
                    <span>{score.userName}</span>
                  </div>
                  <span className="font-semibold">{score.score} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Group Challenge Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-bible-navy" />
              Desafio em Grupo
            </CardTitle>
            <CardDescription>
              Crie um desafio e convide seus amigos!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateGroupChallenge}
              variant="outline"
              className="w-full border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white"
            >
              Criar Desafio em Grupo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BibleChallenge;