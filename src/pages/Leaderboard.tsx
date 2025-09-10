import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  School,
  Target,
  Calendar
} from "lucide-react";

// --- keep small mock fallback lists in case API not reachable ---
const FALLBACK_GLOBAL = [
  { _id: "1", name: "Emma Green", school: "Eco High School", ecoPoints: 4850, avatar: null, rank: 1, change: 0 },
  { _id: "2", name: "Marcus Earth", school: "Green Valley Academy", ecoPoints: 4720, avatar: null, rank: 2, change: 1 },
  { _id: "3", name: "Alex Johnson", school: "Nature's Best School", ecoPoints: 2450, avatar: null, rank: 3, change: -1 },
  { _id: "4", name: "Sophia Wind", school: "Renewable High", ecoPoints: 2340, avatar: null, rank: 4, change: 2 },
  { _id: "5", name: "Diego Solar", school: "Clean Energy School", ecoPoints: 2100, avatar: null, rank: 5, change: 0 },
  { _id: "6", name: "Luna Ocean", school: "Blue Planet Academy", ecoPoints: 1980, avatar: null, rank: 6, change: -2 },
  { _id: "7", name: "Forest Pine", school: "Tree Hugger High", ecoPoints: 1850, avatar: null, rank: 7, change: 1 },
  { _id: "8", name: "River Stone", school: "Earth Science School", ecoPoints: 1720, avatar: null, rank: 8, change: 0 },
];

const FALLBACK_SCHOOLS = [
  { id: 1, name: "Eco High School", totalPoints: 125850, studentCount: 342, rank: 1, change: 0 },
  { id: 2, name: "Green Valley Academy", totalPoints: 118920, studentCount: 298, rank: 2, change: 1 },
  { id: 3, name: "Nature's Best School", totalPoints: 95400, studentCount: 185, rank: 3, change: -1 },
  { id: 4, name: "Renewable High", totalPoints: 87650, studentCount: 220, rank: 4, change: 0 },
  { id: 5, name: "Clean Energy School", totalPoints: 76890, studentCount: 156, rank: 5, change: 2 },
];

const FALLBACK_WEEKLY = [
  { id: 1, name: "Emma Green", pointsThisWeek: 450, quizzesCompleted: 12 },
  { id: 2, name: "Marcus Earth", pointsThisWeek: 420, quizzesCompleted: 11 },
  { id: 3, name: "Alex Johnson", pointsThisWeek: 380, quizzesCompleted: 10 },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("global");
  const [board, setBoard] = useState<any[]>([]);
  const [schoolBoard, setSchoolBoard] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // read local user (persisted by Welcome/login) so we can highlight and merge
  const getLocalUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getApiBase = () => {
    try {
      // Vite
      // @ts-ignore
      if ((import.meta as any)?.env?.VITE_AUTH_URL) return (import.meta as any).env.VITE_AUTH_URL;
    } catch {}
    try {
      // CRA
      // @ts-ignore
      if (typeof process !== "undefined" && (process as any).env && (process as any).env.REACT_APP_AUTH_URL) {
        return (process as any).env.REACT_APP_AUTH_URL;
      }
    } catch {}
    return "http://localhost:5000";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const base = getApiBase();
      const localUser = getLocalUser();

      try {
        const res = await fetch(`${base}/api/leaderboard`);
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          // server should return { leaderboard: [...], schools?: [...], weekly?: [...] }
          const srvBoard = Array.isArray(json.leaderboard) ? json.leaderboard : [];
          const srvSchools = Array.isArray(json.schools) ? json.schools : [];
          const srvWeekly = Array.isArray(json.weekly) ? json.weekly : [];

          // normalize and sort by ecoPoints desc
          const normalized = srvBoard.map((u: any) => ({
            _id: String(u._id ?? u.id ?? u.email ?? Math.random().toString(36).slice(2)),
            name: u.name ?? u.email ?? "User",
            school: u.school ?? u.schoolName ?? "",
            ecoPoints: Number(u.ecoPoints ?? 0),
            avatar: u.avatar ?? null,
            change: Number(u.change ?? 0),
          })).sort((a: any, b: any) => b.ecoPoints - a.ecoPoints);

          // if localUser exists, ensure it's present and up-to-date
          if (localUser) {
            const localId = String(localUser.id ?? localUser._id ?? localUser.email ?? "");
            const idx = normalized.findIndex((x: any) => String(x._id) === localId || String(x.name) === String(localUser.name) || String(x.email) === String(localUser.email));
            const localEntry = {
              _id: localId || `local-${Math.random().toString(36).slice(2)}`,
              name: localUser.name ?? localUser.email ?? "You",
              school: localUser.school ?? "",
              ecoPoints: Number(localUser.ecoPoints ?? 0),
              avatar: localUser.avatar ?? null,
              change: 0
            };
            if (idx >= 0) {
              // if API value differs from local (user recently earned points client-side), prefer the larger ecoPoints
              normalized[idx] = {
                ...normalized[idx],
                ecoPoints: Math.max(normalized[idx].ecoPoints ?? 0, localEntry.ecoPoints),
                name: normalized[idx].name || localEntry.name
              };
            } else {
              // insert local user so user sees self in list
              normalized.push(localEntry);
            }
            // re-sort after merge
            normalized.sort((a: any, b: any) => b.ecoPoints - a.ecoPoints);
          }

          // set rank numbers
          const ranked = normalized.map((u: any, i: number) => ({ ...u, rank: i + 1 }));
          setBoard(ranked);

          // schools / weekly fallback to server or to local fallback
          setSchoolBoard(srvSchools.length ? srvSchools : FALLBACK_SCHOOLS);
          setWeekly(srvWeekly.length ? srvWeekly : FALLBACK_WEEKLY);
        } else {
          console.warn("leaderboard fetch failed", res.status);
          // fallback: try to merge local user into FALLBACK_GLOBAL
          const fallback = [...FALLBACK_GLOBAL];
          const localUser = getLocalUser();
          if (localUser) {
            const localId = String(localUser.id ?? localUser._id ?? localUser.email ?? "");
            const idx = fallback.findIndex(u => String(u._id) === localId || u.name === localUser.name || u.name === localUser.email);
            const entry = {
              _id: localId || `local-${Math.random().toString(36).slice(2)}`,
              name: localUser.name ?? localUser.email ?? "You",
              school: localUser.school ?? "",
              ecoPoints: Number(localUser.ecoPoints ?? 0),
              avatar: localUser.avatar ?? null,
              change: 0,
            };
            if (idx >= 0) fallback[idx] = { ...fallback[idx], ecoPoints: Math.max(fallback[idx].ecoPoints, entry.ecoPoints) };
            else fallback.push(entry);
          }
          const ranked = fallback.sort((a, b) => b.ecoPoints - a.ecoPoints).map((u, i) => ({ ...u, rank: i + 1 }));
          setBoard(ranked);
          setSchoolBoard(FALLBACK_SCHOOLS);
          setWeekly(FALLBACK_WEEKLY);
        }
      } catch (e) {
        console.error("leaderboard request error", e);
        // use fallback with potential local merge
        const fallback = [...FALLBACK_GLOBAL];
        const localUser = getLocalUser();
        if (localUser) {
          const localId = String(localUser.id ?? localUser._id ?? localUser.email ?? "");
          const idx = fallback.findIndex(u => String(u._id) === localId || u.name === localUser.name || u.name === localUser.email);
          const entry = {
            _id: localId || `local-${Math.random().toString(36).slice(2)}`,
            name: localUser.name ?? localUser.email ?? "You",
            school: localUser.school ?? "",
            ecoPoints: Number(localUser.ecoPoints ?? 0),
            avatar: localUser.avatar ?? null,
            change: 0,
          };
          if (idx >= 0) fallback[idx] = { ...fallback[idx], ecoPoints: Math.max(fallback[idx].ecoPoints, entry.ecoPoints) };
          else fallback.push(entry);
        }
        const ranked = fallback.sort((a, b) => b.ecoPoints - a.ecoPoints).map((u, i) => ({ ...u, rank: i + 1 }));
        setBoard(ranked);
        setSchoolBoard(FALLBACK_SCHOOLS);
        setWeekly(FALLBACK_WEEKLY);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-badge-gold" />;
      case 2:
        return <Medal className="h-5 w-5 text-badge-silver" />;
      case 3:
        return <Trophy className="h-5 w-5 text-badge-bronze" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-badge-gold/10 text-badge-gold border-badge-gold/20";
      case 2:
        return "bg-badge-silver/10 text-badge-silver border-badge-silver/20";
      case 3:
        return "bg-badge-bronze/10 text-badge-bronze border-badge-bronze/20";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (change < 0) return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
    return <div className="h-3 w-3" />; // Empty space for no change
  };

  if (loading) return <div className="container py-8">Loading leaderboard…</div>;

  const localUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header user={localUser ?? undefined} />

      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
            <Trophy className="h-8 w-8 text-badge-gold" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">See how you compare with eco-warriors worldwide!</p>
        </div>

        {/* Top 3 Showcase (from fetched board or fallback) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {board.slice(0, 3).map((user, index) => (
            <Card
              key={user._id ?? index}
              className={`shadow-card ${index === 0 ? 'ring-2 ring-badge-gold/20 bg-gradient-to-b from-badge-gold/5 to-transparent' : ''}`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {getRankIcon(user.rank)}
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback className="text-lg font-semibold">
                    {(user.name || "U").split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{user.school}</p>
                <Badge variant="secondary" className="bg-eco-points/10 text-eco-points border-eco-points/20">
                  {(user.ecoPoints ?? 0).toLocaleString()} points
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Global Student Rankings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {board.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-accent/50 ${
                        localUser && (String(user._id) === String(localUser.id ?? localUser._id ?? localUser.email) || user.name === localUser.name) ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className={getRankBadgeColor(user.rank)}>
                          #{user.rank}
                        </Badge>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback>
                            {(user.name || "U").split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.name}</h4>
                            {localUser && (String(user._id) === String(localUser.id ?? localUser._id ?? localUser.email) || user.name === localUser.name) && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.school}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-semibold text-eco-points">
                            {(user.ecoPoints ?? 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">eco points</div>
                        </div>
                        {getChangeIcon(user.change ?? 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-primary" />
                  <span>School Rankings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schoolBoard.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className={getRankBadgeColor(school.rank)}>
                          #{school.rank}
                        </Badge>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-eco text-white font-bold">
                          {school.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{school.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {school.studentCount} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-semibold text-eco-points">
                            {school.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">total points</div>
                        </div>
                        {getChangeIcon(school.change)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>This Week's Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weekly.map((user, index) => (
                    <div
                      key={user.id ?? index}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className={getRankBadgeColor(index + 1)}>
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {(user.name || "U").split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.quizzesCompleted} quizzes completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-success">
                          +{user.pointsThisWeek}
                        </div>
                        <div className="text-xs text-muted-foreground">this week</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    </div>
  );
}