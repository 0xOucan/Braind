import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, Puzzle, Clock, Eye, Coins } from "lucide-react"

const games = [
  {
    id: 1,
    name: "MemoryBlitz",
    description: "Test your memory with increasingly complex pixel patterns",
    icon: Brain,
    difficulty: "Medium",
    reward: "50 $STARK",
    players: 1247,
    color: "bg-red-500",
  },
  {
    id: 2,
    name: "LogicLab",
    description: "Solve intricate puzzles using pure logical reasoning",
    icon: Puzzle,
    difficulty: "Hard",
    reward: "75 $STARK",
    players: 892,
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "SpeedSync",
    description: "React lightning-fast to visual and audio cues",
    icon: Zap,
    difficulty: "Easy",
    reward: "25 $STARK",
    players: 2156,
    color: "bg-yellow-500",
  },
  {
    id: 4,
    name: "PatternPro",
    description: "Identify and complete complex geometric sequences",
    icon: Target,
    difficulty: "Medium",
    reward: "60 $STARK",
    players: 1034,
    color: "bg-green-500",
  },
  {
    id: 5,
    name: "TimeWarp",
    description: "Master time-based challenges and temporal puzzles",
    icon: Clock,
    difficulty: "Hard",
    reward: "80 $STARK",
    players: 567,
    color: "bg-purple-500",
  },
  {
    id: 6,
    name: "VisionQuest",
    description: "Enhance visual perception with optical illusions",
    icon: Eye,
    difficulty: "Medium",
    reward: "55 $STARK",
    players: 1389,
    color: "bg-pink-500",
  },
]

export function GamesCatalog() {
  return (
    <section id="games" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Game Catalog</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your challenge and start training your brain with our collection of pixel art games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <Card
                key={game.id}
                className="retro-shadow hover:retro-shadow-accent transition-all duration-300 border-2 border-border hover:border-primary/50"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center pixel-art retro-shadow`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant={
                        game.difficulty === "Easy"
                          ? "secondary"
                          : game.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{game.name}</CardTitle>
                  <CardDescription className="text-base">{game.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-accent font-semibold">
                      <Coins className="w-4 h-4 mr-1" />
                      {game.reward}
                    </div>
                    <div className="text-sm text-muted-foreground">{game.players.toLocaleString()} players</div>
                  </div>

                  <Button className="w-full retro-shadow">Play {game.name}</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
