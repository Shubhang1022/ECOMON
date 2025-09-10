import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  timeLimit?: number;
  showFeedback?: boolean;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  timeLimit = 30,
  showFeedback = true
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const handleAnswerSelect = (answer: string) => {
    if (showAnswer || selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    
    if (showFeedback) {
      setShowAnswer(true);
      setTimeout(() => {
        onAnswer(answer, isCorrect);
      }, 2000); // Show feedback for 2 seconds
    } else {
      onAnswer(answer, isCorrect);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!showAnswer) {
      return selectedAnswer === option
        ? "border-primary bg-primary/10"
        : "border-border hover:border-primary/50 hover:bg-primary/5";
    }

    if (option === question.correctAnswer) {
      return "border-success bg-success/10 text-success";
    }
    
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return "border-destructive bg-destructive/10 text-destructive";
    }

    return "border-muted bg-muted/50 text-muted-foreground";
  };

  const getOptionIcon = (option: string) => {
    if (!showAnswer) return null;
    
    if (option === question.correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    
    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        
        <Progress value={(questionNumber / totalQuestions) * 100} className="mb-4" />
        
        <CardTitle className="text-lg leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={showAnswer || !!selectedAnswer}
            className={cn(
              "w-full p-4 text-left border rounded-lg transition-all duration-200",
              "flex items-center justify-between",
              getOptionStyle(option),
              showAnswer || selectedAnswer ? "cursor-default" : "cursor-pointer"
            )}
          >
            <span className="font-medium">{option}</span>
            {getOptionIcon(option)}
          </button>
        ))}

        {showAnswer && question.explanation && (
          <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-2">
              <Leaf className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1">Did you know?</h4>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {showAnswer && (
          <div className="flex justify-center pt-4">
            <div className="flex items-center space-x-2 text-sm">
              {selectedAnswer === question.correctAnswer ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">Correct! +10 eco points</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">Incorrect, but keep learning!</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}