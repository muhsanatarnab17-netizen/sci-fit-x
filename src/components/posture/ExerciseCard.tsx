import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/posture-exercises";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="glass border-primary/10 hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              {exercise.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
          </div>
          <Badge variant="outline" className={cn("shrink-0", difficultyColors[exercise.difficulty])}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {exercise.duration}
          </span>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm font-medium mb-2">How to do it:</p>
            <ol className="space-y-2">
              {exercise.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Steps
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Steps
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
