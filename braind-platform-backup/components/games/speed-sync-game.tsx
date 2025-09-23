"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Play, Trophy, Target } from "lucide-react"

type GameState = "waiting" | "ready" | "playing" | "correct" | "wrong" | "complete"

interface Challenge {
  type: "visual" | "audio" | "mixed"
  color?: string
  sound?: string
  direction?: "up" | "down" | "left" | "right"
  delay: number
}

const colors = ["red", "blue", "green", "yellow", "purple", "orange"]
const directions = ["up", "down", "left", "right"]

export function SpeedSyncGame() {
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0)
  const [streak, setStreak] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)

  const generateChallenge = useCallback((): Challenge => {
    const types: Challenge["type"][] = level > 3 ? ["visual", "audio", "mixed"] : ["visual"]
    const type = types[Math.floor(Math.random() * types.length)]

    const challenge: Challenge = {
      type,
      delay: Math.max(500, 2000 - level * 100), // Faster as level increases
    }

    if (type === "visual" || type === "mixed") {
      challenge.color = colors[Math.floor(Math.random() * colors.length)]
      challenge.direction = directions[Math.floor(Math.random() * directions.length)]
    }

    if (type === "audio" || type === "mixed") {
      challenge.sound = `beep-${Math.floor(Math.random() * 3) + 1}`
    }

    return challenge
  }, [level])

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setReactionTime(null)
    setBestTime(null)
    startRound()
  }

  const startRound = () => {
    setGameState("ready")
    setTimeout(
      () => {
        const challenge = generateChallenge()
        setCurrentChallenge(challenge)
        setChallengeStartTime(Date.now())
        setGameState("playing")
      },
      Math.random() * 2000 + 1000,
    ) // Random delay between 1-3 seconds
  }

  const handleReaction = () => {
    if (gameState !== "playing") return

    const endTime = Date.now()
    const reactionMs = endTime - challengeStartTime
    setReactionTime(reactionMs)

    // Good reaction time is under 500ms
    if (reactionMs < 500) {
      const points = Math.max(10, 100 - Math.floor(reactionMs / 10))
      setScore(score + points)
      setStreak(streak + 1)
      setGameState("correct")

      if (!bestTime || reactionMs < bestTime) {
        setBestTime(reactionMs)
      }

      setTimeout(() => {
        if (streak + 1 >= 10) {
          setLevel(level + 1)
          setStreak(0)
        }

        if (level >= 10 && streak + 1 >= 10) {
          setGameState("complete")
        } else {
          startRound()
        }
      }, 1500)
    } else {
      setGameState("wrong")
      setStreak(0)
      setLives(lives - 1)

      setTimeout(() => {
        if (lives - 1 <= 0) {
          setGameState("complete")
        } else {
          startRound()
        }
      }, 1500)
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return "↑"
      case "down":
        return "↓"
      case "left":
        return "←"
      case "right":
        return "→"
      default:
        return "•"
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="retro-shadow border-2 border-primary/20 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            SpeedSync Challenge
          </CardTitle>
          <CardDescription>React lightning-fast to visual and audio cues. Speed is everything!</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{lives}</div>
              <div className="text-sm text-muted-foreground">Lives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{bestTime ? `${bestTime}ms` : "--"}</div>
              <div className="text-sm text-muted-foreground">Best Time</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{streak}/10 reactions</span>
            </div>
            <Progress value={(streak / 10) * 100} className="retro-shadow" />
          </div>

          {/* Game State Messages */}
          <div className="text-center">
            {gameState === "waiting" && (
              <div className="space-y-4">
                <p className="text-lg">Ready to test your reaction speed?</p>
                <Button onClick={startGame} className="retro-shadow">
                  <Play className="w-4 h-4 mr-2" />
                  Start Challenge
                </Button>
              </div>
            )}

            {gameState === "ready" && (
              <div className="space-y-2">
                <Badge variant="secondary" className="retro-shadow">
                  Get Ready...
                </Badge>
                <p className="text-sm text-muted-foreground">Click when you see the signal!</p>
              </div>
            )}

            {gameState === "correct" && reactionTime && (
              <div className="space-y-2">
                <Badge variant="secondary" className="retro-shadow text-green-600">
                  <Target className="w-4 h-4 mr-2" />
                  Great Reaction!
                </Badge>
                <p className="text-lg font-bold text-accent">{reactionTime}ms</p>
                <p className="text-sm text-muted-foreground">
                  {reactionTime < 200
                    ? "Lightning fast!"
                    : reactionTime < 300
                      ? "Excellent!"
                      : reactionTime < 400
                        ? "Very good!"
                        : "Good!"}
                </p>
              </div>
            )}

            {gameState === "wrong" && reactionTime && (
              <div className="space-y-2">
                <Badge variant="destructive" className="retro-shadow">
                  Too Slow!
                </Badge>
                <p className="text-lg font-bold text-destructive">{reactionTime}ms</p>
                <p className="text-sm text-muted-foreground">Try to react in under 500ms</p>
              </div>
            )}

            {gameState === "complete" && (
              <div className="space-y-4">
                <Badge variant="secondary" className="retro-shadow text-green-600">
                  <Trophy className="w-4 h-4 mr-2" />
                  {lives > 0 ? "Challenge Complete!" : "Game Over!"}
                </Badge>
                <p className="text-lg font-bold">Final Score: {score} points</p>
                {bestTime && <p className="text-accent font-semibold">Best Reaction: {bestTime}ms</p>}
                <p className="text-accent font-semibold">You earned 25 $STARK!</p>
                <Button onClick={startGame} className="retro-shadow">
                  <Play className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>

          {/* Game Area */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Main Reaction Button */}
              <button
                onClick={handleReaction}
                disabled={gameState !== "playing"}
                className={`
                  w-48 h-48 rounded-full pixel-art retro-shadow transition-all duration-200
                  ${
                    gameState === "playing"
                      ? "bg-primary hover:scale-105 hover:retro-shadow-accent cursor-pointer animate-pulse"
                      : "bg-muted cursor-not-allowed"
                  }
                  ${gameState === "ready" ? "bg-muted/50" : ""}
                `}
              >
                <div className="text-white text-2xl font-bold">
                  {gameState === "playing" ? "CLICK!" : gameState === "ready" ? "WAIT..." : "READY?"}
                </div>
              </button>

              {/* Visual Challenge Indicator */}
              {gameState === "playing" && currentChallenge && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  {currentChallenge.color && (
                    <div
                      className={`w-12 h-12 rounded-lg ${getColorClass(currentChallenge.color)} retro-shadow animate-bounce`}
                    />
                  )}
                  {currentChallenge.direction && (
                    <div className="text-4xl font-bold text-primary animate-bounce mt-2">
                      {getDirectionIcon(currentChallenge.direction)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Click the button as fast as possible when it lights up!</p>
            <p>React in under 500ms to score points and maintain your streak.</p>
            <p>Complete 10 reactions to advance to the next level.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
