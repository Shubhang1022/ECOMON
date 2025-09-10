import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { EcoPointsDisplay } from "@/components/gamification/EcoPointsDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Trophy,
  Target,
  Calendar,
  Users,
  Award,
  TrendingUp,
  BookOpen,
  Camera,
  Leaf
} from "lucide-react";

type Quiz = { id: string | number; title: string; difficulty?: string; questions?: number; points?: number; completed?: boolean };

export default function Dashboard() {
  // replace the existing user/init code with this normalized fallback
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // persisted user from localStorage (used as immediate fallback)
  const persistedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // prefer live user state, otherwise use persisted local user
  const displayUser = (() => {
    const u = user ?? persistedUser;
    if (!u || typeof u !== "object") {
      return { name: "Guest", email: "", id: "", ecoPoints: 0, level: 1, streakDays: 0, quizzesCompleted: 0, tasksCompleted: 0, nextLevelPoints: 1000, badges: [] as any[], role: "student" as "student" | "teacher" | "admin", avatar: undefined as string | undefined };
    }
    const levelNum = Number(u.level ?? 1);
    const ecoPointsNum = Number(u.ecoPoints ?? 0);
    const allowedRoles = ["student", "teacher", "admin"] as const;
    const roleVal = (typeof u.role === "string" && (allowedRoles as readonly string[]).includes(String(u.role))) ? (u.role as "student" | "teacher" | "admin") : "student";
    return {
      name: String(u.name ?? u.email ?? "Guest"),
      email: String(u.email ?? ""),
      id: String(u.id ?? u._id ?? ""),
      ecoPoints: ecoPointsNum,
      level: levelNum,
      streakDays: Number(u.streakDays ?? 0),
      quizzesCompleted: Number(u.quizzesCompleted ?? 0),
      tasksCompleted: Number(u.tasksCompleted ?? 0),
      // nextLevelPoints: prefer server value, otherwise compute a reasonable default threshold for the next level
      nextLevelPoints: Number(u.nextLevelPoints ?? ((levelNum + 1) * 1000)),
      // ensure badges is always an array so UI mapping is safe
      badges: Array.isArray(u.badges) ? u.badges : [],
      role: roleVal,
      avatar: u.avatar ? String(u.avatar) : undefined,
    };
  })();

  const [leaderboard, setLeaderboard] = useState<Array<any>>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Resolve API base safely (Vite or CRA) with fallback
  const getApiBase = () => {
    // Vite: use import.meta.env.VITE_AUTH_URL if available
    try {
      // import.meta may not be available in all environments; silence TS and runtime errors
      // @ts-ignore
      if ((import.meta as any)?.env?.VITE_AUTH_URL) {
        // @ts-ignore
        return (import.meta as any).env.VITE_AUTH_URL;
      }
    } catch (e) { /* ignore */ }

    try {
      // CRA / webpack: process.env.REACT_APP_AUTH_URL
      if (typeof process !== "undefined" && (process as any).env && (process as any).env.REACT_APP_AUTH_URL) {
        return (process as any).env.REACT_APP_AUTH_URL;
      }
    } catch (e) { /* ignore */ }

    // fallback
    return "http://localhost:5000";
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setPageError(null);
      const base = getApiBase();
      const token = localStorage.getItem("token");

      try {
        // If token present, prefer server-validated user (refresh). Otherwise keep localStorage user (if any).
        if (token) {
          try {
            const resUser = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (resUser.ok) {
              const json = await resUser.json();
              setUser(json.user);
              // persist updated user
              try { localStorage.setItem("user", JSON.stringify(json.user)); } catch {}
            } else {
              setUser(null);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              const text = await resUser.text().catch(()=>null);
              console.error("auth/me failed:", resUser.status, text);
              setPageError(`Failed to load user: ${resUser.status} ${text ?? ""}`);
            }
          } catch (e:any) {
            console.warn("Failed to refresh user from server, keeping local user if any", e);
            setPageError(String(e?.message || e));
          }
        }

        // load leaderboard
        try {
          const resLb = await fetch(`${base}/api/leaderboard`);
          if (resLb.ok) {
            const jl = await resLb.json();
            setLeaderboard(jl.leaderboard ?? []);
          } else if (resLb.status === 404) {
            // backend doesn't provide leaderboard endpoint — continue silently
            console.info("/api/leaderboard not found (404). Continuing without leaderboard.");
            setLeaderboard([]);
          } else {
            const text = await resLb.text().catch(()=>null);
            console.error("leaderboard fetch failed:", resLb.status, text);
            setPageError(`Failed to load leaderboard: ${resLb.status}`);
            setLeaderboard([]);
          }
        } catch (e:any) {
          console.error("leaderboard request error:", e);
          setLeaderboard([]);
          setPageError(String(e?.message || e));
        }

        // load quizzes (optional server endpoint)
        try {
          const resQ = await fetch(`/ai-quiz`);
          if (resQ.ok) {
            const jq = await resQ.json();
            setQuizzes(Array.isArray(jq.quizzes) ? jq.quizzes : []);
          } else if (resQ.status === 404) {
            // endpoint not implemented on server — continue with no quizzes
            setQuizzes([]);
            console.info("/ai-quiz not found (404). Continuing with no quizzes.");
          } else {
            setQuizzes([]);
            const text = await resQ.text().catch(()=>null);
            console.warn("quizzes fetch failed:", resQ.status, text);
          }
        } catch (e:any) {
          console.warn("quizzes request error:", e);
          setQuizzes([]);
        }
      } catch (err:any) {
        console.error("loadAll error:", err);
        setPageError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // compute rank from leaderboard using user id or email
  const computeRank = () => {
    if (!displayUser || !leaderboard || leaderboard.length === 0) return "—";
    const keyId = String(displayUser.id ?? "");
    const keyEmail = String(displayUser.email ?? "");
    const idx = leaderboard.findIndex((u: any) => {
      const uid = String(u._id ?? u.id ?? u.email ?? "");
      return uid === keyId || uid === keyEmail;
    });
    return idx >= 0 ? idx + 1 : "—";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleStartQuiz = (quiz: Quiz) => {
    navigate("/ai-quiz", { state: { quizId: quiz.id } });
  };

  // mark quiz complete and update server-side user stats
  const handleCompleteQuiz = async (quiz: Quiz) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Login to record quiz completion"); return; }
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/user/complete-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reward: quiz.points ?? 100, score: (quiz.questions ?? 10), total: (quiz.questions ?? 10) })
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("complete-quiz failed", txt);
        alert("Failed to record completion");
        return;
      }
      const j = await res.json();
      setUser(j.user);
      try { localStorage.setItem("user", JSON.stringify(j.user)); } catch {}
      // refresh leaderboard
      const resLb = await fetch(`${base}/api/leaderboard`);
      if (resLb.ok) {
        const jl = await resLb.json();
        setLeaderboard(jl.leaderboard ?? []);
      }
      setQuizzes((prev) => prev.map(q => q.id === quiz.id ? { ...q, completed: true } : q));
    } catch (e) {
      console.error("Failed to complete quiz", e);
      alert("Request failed");
    }
  };

  if (loading) return <div className="container py-8">Loading...</div>;

  // show error banner but continue rendering dashboard with best-effort user data
  const displayUserFinal = displayUser; // normalized user object defined above

  return (
    <div className="min-h-screen bg-background">
      {/* keep any inline error banner if present */}
      {pageError && (
        <div className="container py-4">
          <div className="p-3 rounded border bg-red-50 text-red-700">
            <strong>Error:</strong> {pageError}
            <div className="text-sm text-muted-foreground mt-1">Ensure auth server is running and check browser console/network for details.</div>
          </div>
        </div>
      )}

      <Header user={displayUser} onLogout={handleLogout} />

      <div className="container py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {displayUser.name || displayUser.email || "Guest"}! 🌱</h1>
          <p className="text-muted-foreground">Ready to continue your eco-learning journey?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
                  <p className="text-2xl font-bold text-primary">#{computeRank()}</p>
                </div>
                <Trophy className="h-8 w-8 text-badge-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak Days</p>
                  <p className="text-2xl font-bold text-eco-points">{displayUserFinal.streakDays}</p>
                </div>
                <Calendar className="h-8 w-8 text-eco-points" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quizzes Done</p>
                  <p className="text-2xl font-bold text-primary">{displayUserFinal.quizzesCompleted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                  <p className="text-2xl font-bold text-success">{displayUserFinal.tasksCompleted}</p>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EcoPointsDisplay
              currentPoints={displayUserFinal.ecoPoints}
              nextLevelPoints={displayUserFinal.nextLevelPoints}
              level={displayUserFinal.level}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-badge-gold" />
                  <span>Your Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(displayUserFinal.badges || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">No badges yet</div>
                ) : (
                  (displayUserFinal.badges || []).map((badge: any) => (
                    <div
                      key={badge.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg bg-card"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{badge.name}</h4>
                          <Badge variant="secondary">{badge.rarity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Activity / Leaderboard */}
            {/* <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Leaderboard (top 10)</span>
                </CardTitle>
              </CardHeader> */}
              {/* <CardContent className="space-y-3">
                {leaderboard.slice(0, 10).map((u: any, idx: number) => (
                  <div key={u._id ?? u.id ?? idx} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name ?? u.email ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">#{idx + 1} • {u.ecoPoints ?? 0} pts</p>
                    </div>
                    {String(u._id ?? u.id ?? u.email) === String(displayUserFinal?.id ?? displayUserFinal?.email) ? (
                      <Badge className="bg-primary/10 text-primary">You</Badge>
                    ) : null}
                  </div>
                ))}
                <div className="mt-3">
                  <Button className="w-full" variant="outline" onClick={() => navigate("/leaderboard")}>
                    View Full Leaderboard
                  </Button>
                </div>
              </CardContent> */}
            {/* </Card> */}

            {/* Quick Actions */}
            {/* <Card className="shadow-card">d
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="eco" onClick={() => navigate("/real-tasks")}>
                  <Camera className="mr-2 h-4 w-4" />
                  Submit Task Photo
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/leaderboard")}>
                  <Users className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/challenges")}>
                  <Leaf className="mr-2 h-4 w-4" />
                  Browse Challenges
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}