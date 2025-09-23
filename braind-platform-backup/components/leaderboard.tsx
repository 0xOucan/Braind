import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown } from "lucide-react"

const leaderboardData = [
  {
    rank: 1,
    player: "PixelMaster",
    score: 15420,
    games: 127,
    earnings: "2,340 $STARK",
    avatar: "🧠",
  },
  {
    rank: 2,
    player: "BrainWizard",
    score: 14890,
    games: 98,
    earnings: "2,180 $STARK",
    avatar: "🎯",
  },
  {
    rank: 3,
    player: "LogicLord",
    score: 14250,
    games: 156,
    earnings: "2,050 $STARK",
    avatar: "⚡",
  },
  {
    rank: 4,
    player: "MemoryKing",
    score: 13780,
    games: 89,
    earnings: "1,920 $STARK",
    avatar: "🔥",
  },
  {
    rank: 5,
    player: "SpeedDemon",
    score: 13340,
    games: 203,
    earnings: "1,800 $STARK",
    avatar: "💫",
  },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Trophy className="w-6 h-6 text-gray-400" />
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />
    default:
      return <Award className="w-6 h-6 text-muted-foreground" />
  }
}

export function Leaderboard() {
  return (
    <section id="leaderboard" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Global Leaderboard</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how you stack up against the world's best brain trainers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="retro-shadow border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Top Brain Champions
              </CardTitle>
              <CardDescription>Rankings updated in real-time based on total score across all games</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {leaderboardData.map((player, index) => (
                  <div
                    key={player.rank}
                    className={`p-6 flex items-center justify-between hover:bg-muted/50 transition-colors ${index === 0 ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(player.rank)}
                        <span className="text-2xl font-bold text-primary">#{player.rank}</span>
                      </div>

                      <div className="text-3xl pixel-art">{player.avatar}</div>

                      <div>
                        <h3 className="font-bold text-lg">{player.player}</h3>
                        <p className="text-muted-foreground">{player.games} games played</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">{player.score.toLocaleString()}</div>
                      <Badge variant="secondary" className="retro-shadow">
                        {player.earnings}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Want to see your name here? Start playing and climb the ranks!</p>
            <Badge variant="outline" className="retro-shadow">
              Your current rank: #1,247
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
