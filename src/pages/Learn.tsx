import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Topic = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  keywords?: string[];
};

export default function Learn() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/TOPICS/topics.json", { cache: "no-store" });
        if (!res.ok) throw new Error("No topics file");
        const json = await res.json();
        if (Array.isArray(json)) setTopics(json);
        else setTopics([]);
      } catch (e) {
        // fallback minimal topics
        setTopics([
          { id: "t1", title: "Photosynthesis & Carbon Cycle", summary: "How plants absorb CO₂ and produce oxygen; role in climate." },
          { id: "t2", title: "Greenhouse Gases", summary: "Overview of greenhouse gases and their impact." },
          { id: "t3", title: "Water Conservation", summary: "Practical ways to conserve water at home and school." }
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container py-8">Loading topics…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Learn — Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topics.map((t) => (
              <div key={t.id} className="p-4 border rounded-md bg-card flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/learn/${encodeURIComponent(t.id)}`)}>
                    Read
                  </Button>
                  <Button size="sm" variant="eco" onClick={() => navigate(`/ai-quiz?topic=${encodeURIComponent(t.title)}`)}>
                    Take Quiz
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}