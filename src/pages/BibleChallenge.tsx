import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyChallenge {
  id: string;
  title: string;
  date: string;
}

interface UserScore {
  id: string;
  user_id: string;
  score: number;
  completed_at: string;
  profiles: {
    full_name: string | null;
  };
}

const BibleChallenge = () => {
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);

  const { data: dailyChallenge, isLoading: isChallengeLoading } = useQuery({
    queryKey: ["dailyChallenge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .maybeSingle();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar o desafio diário.",
        });
        throw error;
      }

      return data as DailyChallenge | null;
    },
  });

  const { data: topScores } = useQuery({
    queryKey: ["topScores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_scores")
        .select(`
          id,
          user_id,
          score,
          completed_at,
          profiles (
            full_name
          )
        `)
        .order("score", { ascending: false })
        .limit(5);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar o ranking.",
        });
        throw error;
      }

      return data as unknown as UserScore[];
    },
  });

  const handleStartChallenge = () => {
    setIsStarted(true);
  };

  const handleCreateGroupChallenge = () => {
    toast({
      title: "Em breve!",
      description: "A funcionalidade de desafios em grupo estará disponível em breve.",
    });
  };

  if (isChallengeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

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
            {dailyChallenge ? (
              <>
                <h3 className="text-xl font-semibold mb-4">{dailyChallenge.title}</h3>
                <Button
                  onClick={handleStartChallenge}
                  className="w-full bg-bible-navy hover:bg-bible-accent"
                >
                  Começar Desafio
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                Nenhum desafio disponível para hoje. Volte amanhã!
              </p>
            )}
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
              {topScores?.length ? (
                topScores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-bible-navy">{index + 1}º</span>
                      <span>{score.profiles?.full_name || "Anônimo"}</span>
                    </div>
                    <span className="font-semibold">{score.score} pts</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">
                  Nenhuma pontuação registrada ainda.
                </p>
              )}
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