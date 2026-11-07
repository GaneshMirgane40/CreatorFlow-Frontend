import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { connectYouTubeAccount } from "@/services/youtubeOAuthService";
import { getErrorMessage } from "@/lib/workflow";

/** Google redirects here with ?code=... after the creator grants YouTube access. */
export default function YouTubeCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get("code");
  const oauthError = params.get("error");

  const [result, setResult] = useState(null); // { ok: boolean, message: string }
  // Authorization codes are single-use; StrictMode runs effects twice in dev.
  const exchanged = useRef(false);

  useEffect(() => {
    if (oauthError || !code || exchanged.current) return undefined;
    exchanged.current = true;

    let redirectTimer;
    connectYouTubeAccount(code)
      .then(() => {
        setResult({ ok: true, message: "YouTube connected successfully." });
        redirectTimer = setTimeout(() => navigate("/creator/dashboard", { replace: true }), 1500);
      })
      .catch((err) => setResult({ ok: false, message: getErrorMessage(err, "Could not connect YouTube.") }));

    return () => clearTimeout(redirectTimer);
  }, [code, oauthError, navigate]);

  const failure = oauthError
    ? `Google returned an error: ${oauthError}`
    : !code
      ? "No authorization code was received from Google."
      : result && !result.ok
        ? result.message
        : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        {failure ? (
          <>
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h1 className="mb-2 text-xl font-semibold">YouTube connection failed</h1>
            <p className="mb-6 text-sm text-gray-600">{failure}</p>
            <Link to="/creator/dashboard" className="text-sm text-indigo-600 hover:underline">
              Back to dashboard
            </Link>
          </>
        ) : result?.ok ? (
          <>
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <h1 className="mb-2 text-xl font-semibold">YouTube connected</h1>
            <p className="text-sm text-gray-600">Taking you back to your dashboard…</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-gray-400" />
            <h1 className="text-xl font-semibold">Connecting YouTube…</h1>
          </>
        )}
      </div>
    </div>
  );
}
