import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Trophy, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface EcoPointsDisplayProps {
  currentPoints: number;
  nextLevelPoints: number;
  level: number;
  className?: string;
  variant?: "compact" | "detailed";
}

export function EcoPointsDisplay({ 
  currentPoints, 
  nextLevelPoints, 
  level, 
  className,
  variant = "detailed" 
}: EcoPointsDisplayProps) {
  const progress = (currentPoints / nextLevelPoints) * 100;
  const pointsToNext = nextLevelPoints - currentPoints;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Trophy className="h-4 w-4 text-eco-points" />
        <Badge variant="secondary" className="bg-eco-points/10 text-eco-points border-eco-points/20">
          {currentPoints.toLocaleString()} pts
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-xl p-6 shadow-card border", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Eco Points</h3>
          <p className="text-sm text-muted-foreground">Level {level} Eco Warrior</p>
        </div>
        <Badge variant="secondary" className="bg-gradient-eco text-white">
          <Zap className="mr-1 h-3 w-3" />
          Level {level}
        </Badge>
      </div>

      <div className="flex items-center space-x-6">
        <ProgressRing progress={progress} size={100} strokeWidth={8}>
          <div className="text-center">
            <div className="text-xl font-bold text-eco-points">
              {currentPoints.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </ProgressRing>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-eco h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Target className="mr-1 h-3 w-3" />
            {pointsToNext.toLocaleString()} points to next level
          </div>
        </div>
      </div>
    </div>
  );
}