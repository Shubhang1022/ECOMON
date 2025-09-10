import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  hint?: string;
};

type Completed = {
  id: string;
  imageDataUrl: string;
  timestamp: number;
  reward: number;
};

const TASKS: Task[] = [
  { id: "t1", title: "Plant a tree or sapling", description: "Plant one tree/sapling in your locality and take a photo of you planting it.", reward: 100, hint: "Ask permission from adult/owner." },
  { id: "t2", title: "Clean a small litter spot", description: "Collect litter from a small public spot and take a before/after photo (one image acceptable).", reward: 100, hint: "Use gloves and dispose responsibly." },
  { id: "t3", title: "Create a small compost", description: "Start a tiny compost bin/heap and upload a photo of the setup.", reward: 100, hint: "Use kitchen waste only." },
  { id: "t4", title: "Save water challenge", description: "Record a photo that shows you completed a water-saving task (e.g., fixed leak).", reward: 100, hint: "Short caption helps verification." },
  { id: "t5", title: "Make a bird feeder", description: "Make a simple bird feeder and upload a photo of it in use.", reward: 100, hint: "Use recycled materials where possible." }
];

const STORAGE_POINTS = "eco_points";
const STORAGE_COMPLETED = "real_tasks_completed_v1";

export default function RealTasks() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<number>(() => Number(localStorage.getItem(STORAGE_POINTS) || 0));
  const [completed, setCompleted] = useState<Completed[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_COMPLETED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_POINTS, String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(completed));
  }, [completed]);

  const handleFileChange = (taskId: string, file?: File | null) => {
    setError(null);
    setSelectedFiles((s) => ({ ...s, [taskId]: file ?? null }));
    if (!file) {
      setPreviews((p) => ({ ...p, [taskId]: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreviews((p) => ({ ...p, [taskId]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const validateFile = (file: File) => {
    const accept = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!accept.includes(file.type)) return "Only PNG/JPEG/WEBP images are allowed.";
    const maxMB = 6;
    if (file.size > maxMB * 1024 * 1024) return `Image too large. Max ${maxMB} MB allowed.`;
    return null;
  };

  const submitProof = async (task: Task) => {
    setError(null);
    setLoadingTask(task.id);

    try {
      const file = selectedFiles[task.id];
      if (!file) throw new Error("Please choose an image before submitting.");
      const err = validateFile(file);
      if (err) throw new Error(err);

      // convert to data URL (small projects ok; for large production use server or indexedDB)
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result || ""));
        r.onerror = () => rej(new Error("Failed to read file"));
        r.readAsDataURL(file);
      });

      // mark completed and award points
      const comp: Completed = { id: task.id, imageDataUrl: dataUrl, timestamp: Date.now(), reward: task.reward };
      // prevent duplicate completion for same task (optional: allow multiple)
      const already = completed.find((c) => c.id === task.id);
      if (already) {
        setError("You already completed this task.");
        setLoadingTask(null);
        return;
      }

      setCompleted((c) => [...c, comp]);
      setPoints((p) => p + task.reward);

      // reset selection for task
      setSelectedFiles((s) => ({ ...s, [task.id]: null }));
      setPreviews((p) => ({ ...p, [task.id]: "" }));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoadingTask(null);
    }
  };

  const downloadEvidence = (c: Completed) => {
    const blob = dataURLtoBlob(c.imageDataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-${c.id}-${c.timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Real Life Tasks</CardTitle>
            <div className="text-sm text-muted-foreground">
              Complete tasks and upload a photo to earn eco-points (100 points per task).
            </div>
            <div className="mt-2 text-sm">Your points: <strong>{points}</strong></div>
          </CardHeader>
          <CardContent>
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <div className="grid gap-4">
              {TASKS.map((task) => {
                const isDone = completed.some((c) => c.id === task.id);
                return (
                  <div key={task.id} className="p-4 border rounded-md bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        {task.hint && <p className="text-xs mt-1 text-muted-foreground">Hint: {task.hint}</p>}
                        <div className="text-xs mt-2">Reward: <strong>{task.reward} pts</strong></div>
                      </div>
                      <div className="text-right">
                        {isDone ? (
                          <div className="text-sm text-green-700 font-semibold">Completed</div>
                        ) : (
                          <div className="text-sm text-yellow-700">Not done</div>
                        )}
                      </div>
                    </div>

                    {!isDone && (
                      <div className="mt-3">
                        <input
                          aria-label={`Upload proof for ${task.title}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(task.id, e.target.files?.[0] ?? null)}
                        />
                        {previews[task.id] && (
                          <div className="mt-2">
                            <img src={previews[task.id]} alt="preview" className="max-h-40 rounded-md" />
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button onClick={() => submitProof(task)} disabled={loadingTask === task.id}>
                            {loadingTask === task.id ? "Submitting..." : "Submit Proof"}
                          </Button>
                          <Button variant="outline" onClick={() => { setSelectedFiles((s)=>({...s,[task.id]:null})); setPreviews((p)=>({...p,[task.id]:""})); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {isDone && (
                      <div className="mt-3 flex gap-2 items-center">
                        <div className="text-xs text-muted-foreground">Completed at: {new Date(completed.find(c=>c.id===task.id)!.timestamp).toLocaleString()}</div>
                        <Button size="sm" variant="outline" onClick={() => downloadEvidence(completed.find(c=>c.id===task.id)!)}>
                          Download Proof
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completed list */}
            {completed.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold">Your submissions</h4>
                <div className="grid gap-3 mt-3">
                  {completed.map((c) => (
                    <div key={c.id + c.timestamp} className="p-3 border rounded-md flex items-center gap-3">
                      <img src={c.imageDataUrl} alt="evidence" className="h-20 w-20 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-medium">{TASKS.find(t => t.id === c.id)?.title || c.id}</div>
                        <div className="text-xs text-muted-foreground">Received {c.reward} pts • {new Date(c.timestamp).toLocaleString()}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadEvidence(c)}>Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={() => navigate(-1)}>Back</Button>
              <Button variant="ghost" onClick={() => { localStorage.removeItem(STORAGE_COMPLETED); localStorage.removeItem(STORAGE_POINTS); setCompleted([]); setPoints(0); }}>
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}