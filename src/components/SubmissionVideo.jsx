import { useEffect, useState } from "react";
import { Download, Film, Loader2, RotateCw } from "lucide-react";
import { fetchSubmissionVideo } from "@/services/projectService";
import { formatDate, getErrorMessage } from "@/lib/workflow";

/**
 * Player + download for a project submission.
 *
 * The video endpoint requires the JWT, which a plain <video src> can't send,
 * so the file is fetched through axios as a Blob and played from an object URL.
 * The same object URL backs the Download button, so the file is fetched once.
 */
export default function SubmissionVideo({ submission }) {
  const videoUrl = submission?.videoUrl;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ forUrl: null, objectUrl: null, error: null });
  const [progress, setProgress] = useState(null);

  const requestKey = `${videoUrl}#${attempt}`;

  useEffect(() => {
    if (!videoUrl) return undefined;

    const controller = new AbortController();
    let objectUrl = null;

    fetchSubmissionVideo(videoUrl, { signal: controller.signal, onProgress: setProgress })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setState({ forUrl: requestKey, objectUrl, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ forUrl: requestKey, objectUrl: null, error: getErrorMessage(error, "Could not load the video") });
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoUrl, requestKey]);

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-gray-500">
        <Film className="h-8 w-8" />
        <p className="text-sm">No video has been submitted yet.</p>
      </div>
    );
  }

  const ready = state.forUrl === requestKey;
  const objectUrl = ready ? state.objectUrl : null;
  const error = ready ? state.error : null;

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        {objectUrl ? (
          <video key={objectUrl} src={objectUrl} controls className="h-full w-full" preload="metadata">
            Your browser can't play this video. Use the download button instead.
          </video>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
            >
              <RotateCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-300">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading video{progress != null ? ` · ${progress}%` : "…"}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">Version</dt>
            <dd className="font-medium">v{submission.version}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Uploaded by</dt>
            <dd className="font-medium">{submission.uploadedBy || submission.uploadedByEmail || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Uploaded at</dt>
            <dd className="font-medium">{formatDate(submission.uploadedAt, true)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">File</dt>
            <dd className="truncate font-medium" title={submission.fileName}>{submission.fileName}</dd>
          </div>
        </dl>

        <a
          href={objectUrl ?? undefined}
          download={submission.fileName || `submission-v${submission.version}.mp4`}
          aria-disabled={!objectUrl}
          className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition ${
            objectUrl ? "bg-gray-900 hover:bg-gray-700" : "pointer-events-none bg-gray-400"
          }`}
        >
          <Download className="h-4 w-4" /> Download video
        </a>
      </div>
    </div>
  );
}
