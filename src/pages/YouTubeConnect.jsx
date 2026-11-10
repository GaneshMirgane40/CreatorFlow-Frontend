import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MonitorPlay, RefreshCw } from "lucide-react";
import { getYouTubeAuthorizationUrl, getYouTubeConnectionStatus } from "@/services/youtubeOAuthService";
import { getErrorMessage } from "@/lib/workflow";

export default function YouTubeConnect() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setError("");
      setStatus(await getYouTubeConnectionStatus());
    } catch (err) {
      setError(getErrorMessage(err, "Could not check your YouTube connection."));
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const connect = async () => {
    try {
      setConnecting(true);
      window.location.assign(await getYouTubeAuthorizationUrl());
    } catch (err) {
      setConnecting(false);
      setError(getErrorMessage(err, "Could not start YouTube connection."));
    }
  };

  return <main className="mx-auto max-w-2xl p-4 sm:p-8">
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <MonitorPlay className="mb-4 h-10 w-10 text-red-600" />
      <h1 className="text-2xl font-bold text-gray-900">YouTube connection</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">Connect the YouTube channel where approved editor submissions will be published.</p>

      {status === null && !error ? <div className="mt-6 flex items-center gap-2 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Checking connection…</div> : null}
      {error ? <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {status?.connected ? <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Connected</div><p className="mt-1 text-sm">{status.channelTitle || "Your YouTube channel"}</p></div> : <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">No YouTube channel is connected yet. Connect before publishing.</div>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={connect} disabled={connecting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"><MonitorPlay className="h-4 w-4" /> {connecting ? "Opening Google…" : status?.connected ? "Reconnect YouTube" : "Connect YouTube Account"}</button>
        <button type="button" onClick={loadStatus} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Refresh status</button>
      </div>
    </section>
  </main>;
}
