import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Home,
  Target,
  Clock
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  role: "student" as const,
  ecoPoints: 2450,
  avatar: null,
};

// Mock quiz data - would come from Gemini API
const mockQuizData = {
  id: "climate-change-basics",
  title: "Climate Change Basics",
  description: "Test your knowledge about climate change and its impacts",
  difficulty: "Beginner",
  estimatedTime: 10,
  questions: [
    {
      id: "q1",
      question: "Which of the following is the primary greenhouse gas responsible for climate change?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctAnswer: "Carbon Dioxide",
      explanation: "Carbon dioxide (CO2) is the most significant greenhouse gas produced by human activities, primarily from burning fossil fuels."
    },
    {
      id: "q2", 
      question: "What is the main cause of rising sea levels?",
      options: ["Ocean pollution", "Thermal expansion and melting ice", "Underwater earthquakes", "Ocean currents"],
      correctAnswer: "Thermal expansion and melting ice",
      explanation: "As global temperatures rise, seawater expands and ice sheets and glaciers melt, contributing to rising sea levels."
    },
    {
      id: "q3",
      question: "Which renewable energy source is most widely used globally?",
      options: ["Solar power", "Wind power", "Hydroelectric power", "Geothermal power"],
      correctAnswer: "Hydroelectric power",
      explanation: "Hydroelectric power has been the most widely used renewable energy source globally, though solar and wind are rapidly growing."
    },
    {
      id: "q4",
      question: "What percentage of global greenhouse gas emissions come from transportation?",
      options: ["About 5%", "About 14%", "About 24%", "About 50%"],
      correctAnswer: "About 14%",
      explanation: "Transportation accounts for approximately 14% of global greenhouse gas emissions, making it a significant contributor to climate change."
    },
    {
      id: "q5",
      question: "Which of these actions has the biggest impact on reducing your carbon footprint?",
      options: ["Recycling paper", "Taking shorter showers", "Using renewable energy", "Buying local food"],
      correctAnswer: "Using renewable energy",
      explanation: "Switching to renewable energy sources has the largest impact on reducing individual carbon footprints, followed by transportation choices."
    }
  ]
};

type QuizState = "intro" | "active" | "completed";

export default function Quiz() {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; isCorrect: boolean; timeSpent: number }[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  const currentQuestion = mockQuizData.questions[currentQuestionIndex];
  const totalQuestions = mockQuizData.questions.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const ecoPointsEarned = correctAnswers * 10;

  const handleStartQuiz = () => {
    setQuizState("active");
    setStartTime(new Date());
    setQuestionStartTime(new Date());
  };

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    const timeSpent = questionStartTime ? Date.now() - questionStartTime.getTime() : 0;
    
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeSpent
    }]);

    // Move to next question or complete quiz
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionStartTime(new Date());
      } else {
        setQuizState("completed");
      }
    }, 100);
  };

  const handleRetakeQuiz = () => {
    setQuizState("intro");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(null);
    setQuestionStartTime(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const totalTimeSpent = answers.reduce((total, answer) => total + answer.timeSpent, 0);
  const averageTimePerQuestion = answers.length > 0 ? totalTimeSpent / answers.length : 0;

  if (quizState === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <Header user={mockUser} />
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{mockQuizData.title}</CardTitle>
                <p className="text-muted-foreground">{mockQuizData.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-eco-points">{mockQuizData.estimatedTime}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-success">{totalQuestions * 10}</div>
                    <div className="text-sm text-muted-foreground">Max Points</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    {mockQuizData.difficulty} Level
                  </Badge>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Each correct answer earns you 10 eco points. Take your time and learn!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={()=>(window.location.href = '/ai-quiz')} variant="eco" size="lg" className="flex-1">
                      Start Quiz
                    </Button>
                    <Button onClick={handleBackToDashboard} variant="outline" size="lg" className="flex-1">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "active") {
    return (
      <div className="min-h-screen bg-background">
        <Header user={mockUser} />
        <div className="container py-8">
          <QuizCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            onAnswer={handleAnswer}
            timeLimit={60}
            showFeedback={true}
          />
        </div>
      </div>
    );
  }

  // Quiz completed state
  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-eco rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Quiz Completed!</CardTitle>
              <p className="text-muted-foreground">Great job on completing the quiz!</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">{score}%</div>
                <div className="flex items-center justify-center space-x-4">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {correctAnswers} Correct
                  </Badge>
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    {totalQuestions - correctAnswers} Incorrect
                  </Badge>
                </div>
              </div>

              {/* Points Earned */}
              <div className="bg-eco-points/10 border border-eco-points/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-eco-points mb-1">
                  +{ecoPointsEarned} Eco Points!
                </div>
                <p className="text-sm text-muted-foreground">
                  Added to your total score
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.round(averageTimePerQuestion / 1000)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Avg per question</div>
                </div>
                <div className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-lg font-semibold">{mockQuizData.difficulty}</div>
                  <div className="text-xs text-muted-foreground">Difficulty</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="text-center p-4 bg-card border rounded-lg">
                {score >= 80 ? (
                  <p className="text-success">
                    🌟 Excellent work! You're becoming a true eco-warrior!
                  </p>
                ) : score >= 60 ? (
                  <p className="text-eco-points">
                    👍 Good job! Keep learning to become an environmental expert!
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    📚 Keep studying! Every step counts in your environmental journey!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleRetakeQuiz} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button onClick={handleBackToDashboard} variant="eco" size="lg" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}