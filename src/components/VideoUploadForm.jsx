import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { submitProjectVideo } from "@/services/projectService";
import { getErrorMessage } from "@/lib/workflow";

const MAX_BYTES = 200 * 1024 * 1024; // matches spring.servlet.multipart.max-file-size

export default function VideoUploadForm({ projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const uploading = progress !== null;

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);

    if (selected && selected.size > MAX_BYTES) {
      setError("The video is larger than the 200 MB upload limit.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a video to upload.");
      return;
    }

    try {
      setError(null);
      setProgress(0);
      const result = await submitProjectVideo(projectId, file, setProgress);
      toast.success(`Version ${result.version} submitted for review`);
      setFile(null);
      event.target.reset();
      await onUploaded?.(result);
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
      />

      {uploading && (
        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!file || uploading}
        className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UploadCloud className="h-4 w-4" />
        {uploading ? `Uploading… ${progress}%` : "Upload & Submit for Review"}
      </button>
    </form>
  );
}
