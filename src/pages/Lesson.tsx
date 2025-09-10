import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

type Topic = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  keywords?: string[];
};

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/TOPICS/topics.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Topics not found");
        const arr = await res.json();
        const found = Array.isArray(arr) ? arr.find((t: any) => String(t.id) === String(id)) : null;
        if (found) setTopic(found);
        else setTopic(null);
      } catch (e) {
        setTopic(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
    };
  }, []);

  if (loading) return <div className="container py-8">Loading…</div>;
  if (!topic) return <div className="container py-8">Topic not found.</div>;

  const handleTakeQuiz = () => {
    // pass topic title as query param for AiQuiz to use as context
    navigate(`/ai-quiz?topic=${encodeURIComponent(topic.title)}`);
  };

  // helper: get plain text from HTML content
  const htmlToText = (html = "") => {
    if (typeof document === "undefined") {
      // server fallback
      return html.replace(/<[^>]+>/g, " ");
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.innerText;
  };

  const startSpeaking = () => {
    if (!("speechSynthesis" in window)) {
      alert("Voice assistant not available in this browser.");
      return;
    }
    // Cancel any existing
    window.speechSynthesis.cancel();

    const text = htmlToText(topic?.content || "");
    if (!text.trim()) {
      alert("No readable content available.");
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1; // adjust as desired
    u.pitch = 1;
    u.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    u.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  const toggleSpeak = () => {
    if (isSpeaking) stopSpeaking();
    else startSpeaking();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <CardTitle>{topic.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{topic.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isSpeaking ? "destructive" : "outline"}
                  onClick={toggleSpeak}
                  aria-pressed={isSpeaking}
                  aria-label={isSpeaking ? "Stop voice assistant" : "Start voice assistant"}
                >
                  {isSpeaking ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isSpeaking ? "Stop" : "Read"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div>
                {!expanded ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: (topic.content || "").slice(0, 1000) }} />
                    { (topic.content || "").length > 1000 && (
                      <div className="mt-4">
                        <Button variant="outline" onClick={() => setExpanded(true)}>Read more</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: (topic.content || "") }} />
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="eco" onClick={handleTakeQuiz}>Take Quiz on this Topic</Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}