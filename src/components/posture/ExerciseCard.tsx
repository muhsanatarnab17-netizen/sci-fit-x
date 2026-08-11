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
    easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hard: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 antialiased shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2 text-cyan-50 subpixel-antialiased">
              <Dumbbell className="h-4 w-4 text-cyan-400 z-10 antialiased" />
              {exercise.name}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1">{exercise.description}</p>
          </div>
          <Badge variant="outline" className={cn("shrink-0 font-bold text-[10px] uppercase tracking-wider", difficultyColors[exercise.difficulty])}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400/60" />
            {exercise.duration}
          </span>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-zinc-800/50">
            <p className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-widest">Protocol Steps:</p>
            <ol className="space-y-3">
              {exercise.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] flex items-center justify-center font-bold border border-cyan-500/20">
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
          className="w-full mt-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              HIDE PROTOCOL
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              VIEW PROTOCOL
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
