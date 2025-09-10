import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Trophy, 
  Leaf, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface HeaderProps {
  user?: {
    name: string;
    role: "student" | "teacher" | "admin";
    ecoPoints: number;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-eco">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-eco bg-clip-text text-transparent">
            EcoMon
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <Button 
                variant={isActive("/dashboard") ? "eco" : "ghost"} 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button 
                variant={isActive("/ai-quiz") ? "eco" : "ghost"} 
                size="sm"
                onClick={() => navigate("/ai-quiz")}
              >
                Quizzes
              </Button>
              <Button 
                variant={isActive("/leaderboard") ? "eco" : "ghost"} 
                size="sm"
                onClick={() => navigate("/leaderboard")}
              >
                Leaderboard
              </Button>
              {user.role === "teacher" && (
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              )}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Eco Points */}
              <div className="hidden sm:flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-eco-points" />
                <Badge variant="secondary" className="bg-eco-points/10 text-eco-points border-eco-points/20">
                  {user.ecoPoints.toLocaleString()} pts
                </Badge>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Login
              </Button>
              <Button variant="eco" size="sm" onClick={() => navigate("/")}>
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-2">
            {user && (
              <>
                <Button 
                  variant={isActive("/dashboard") ? "eco" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  variant={isActive("/quiz") ? "eco" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/quiz");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Quizzes
                </Button>
                <Button 
                  variant={isActive("/leaderboard") ? "eco" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/leaderboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Leaderboard
                </Button>
                {user.role === "teacher" && (
                  <Button variant="ghost" className="w-full justify-start">
                    Manage
                  </Button>
                )}
                {/* Mobile Eco Points */}
                <div className="flex items-center justify-center pt-2">
                  <Badge variant="secondary" className="bg-eco-points/10 text-eco-points border-eco-points/20">
                    <Trophy className="mr-1 h-3 w-3" />
                    {user.ecoPoints.toLocaleString()} eco points
                  </Badge>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}