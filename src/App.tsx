import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import Dashboard from "@/pages/Dashboard";
import AiQuiz from "@/pages/AiQuiz";
import Learn from "@/pages/Learn";
import Lesson from "@/pages/Lesson";
import RealTasks from "@/pages/RealTasks";
import Leaderboard from "@/pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-quiz" element={<AiQuiz />} />
          <Route path="/real-tasks" element={<RealTasks />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<Lesson />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
