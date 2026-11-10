import { useEffect, useState } from "react";
import { Loader2, RotateCw, Video } from "lucide-react";
import { fetchSourceVideo } from "@/services/projectService";

export default function SourceVideo({ projectId }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ url: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;
    setState({ url: null, error: null });

    fetchSourceVideo(projectId, { signal: controller.signal })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({ url: null, error: error.response?.data?.message || "Could not load the source video." });
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectId, attempt]);

  if (state.url) {
    return <video src={state.url} controls preload="metadata" className="aspect-video w-full rounded-lg bg-black">Your browser cannot play this video.</video>;
  }

  return <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-slate-950 px-6 text-center text-sm text-white">
    {state.error ? <><p>{state.error}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-2 rounded bg-white/15 px-3 py-2 hover:bg-white/25"><RotateCw className="h-4 w-4" /> Retry</button></> : <><Loader2 className="h-6 w-6 animate-spin" /><span>Loading source video…</span></>}
  </div>;
}
