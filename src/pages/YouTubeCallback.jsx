import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle, Video } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { connectYouTubeAccount } from "@/services/youtubeOAuthService";

export default function YouTubeCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasStarted = useRef(false);
  const [state, setState] = useState({ status: "loading", message: "Connecting your YouTube account…" });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const oauthError = params.get("error");

    if (oauthError) {
      setState({ status: "error", message: "Google authorization was cancelled or denied." });
      return;
    }

    if (!code) {
      setState({ status: "error", message: "Google did not return an authorization code." });
      return;
    }

    connectYouTubeAccount(code)
      .then((message) => {
        setState({ status: "success", message: message || "YouTube account connected successfully." });
        window.setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
      })
      .catch((err) => {
        const responseError = err.response?.data;
        setState({ status: "error", message: responseError?.message || (typeof responseError === "string" ? responseError : "Unable to connect the YouTube account. Please try again.") });
      });
  }, [location.search, navigate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";

  return <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center p-4"><section aria-live="polite" className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"><div className={`mx-auto flex size-12 items-center justify-center rounded-full ${isSuccess ? "bg-emerald-100 text-emerald-600" : state.status === "error" ? "bg-red-100 text-red-600" : "bg-red-50 text-red-600"}`}>{isLoading ? <LoaderCircle className="size-6 animate-spin" /> : isSuccess ? <CheckCircle2 className="size-6" /> : <CircleAlert className="size-6" />}</div><Video className="mx-auto mt-5 size-6 text-red-600" /><h1 className="mt-3 text-xl font-bold text-slate-900">{isSuccess ? "YouTube connected" : state.status === "error" ? "Connection failed" : "Connecting YouTube"}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{state.message}</p>{state.status === "error" && <button type="button" onClick={() => navigate("/dashboard", { replace: true })} className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Back to dashboard</button>}</section></main>;
}
