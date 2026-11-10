import { useState, useEffect } from 'react';
import { getAllEditors } from '@/services/userService';
import { assignEditor, uploadSourceVideo } from '@/services/projectService';

export default function AssignEditorModal({ open, project, onClose, onEditorAssigned }) {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEditorId, setSelectedEditorId] = useState('');
  const [sourceVideo, setSourceVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditors = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await getAllEditors();
        setEditors(data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load editors');
      } finally {
        setLoading(false);
      }
    };

    if (open && project) {

      fetchEditors();
    }
  }, [open, project]);

  if (!open) return null;

  const handleClose = () => {
    setEditors([]);
    setSelectedEditorId('');
    setSourceVideo(null);
    setError(null);
    onClose();
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedEditorId) {
      setError('Please select an editor to assign');
      return;
    }

    try {
      setLoading(true);
        await assignEditor(project.id, Number(selectedEditorId));
        if (sourceVideo) {
          await uploadSourceVideo(project.id, sourceVideo);
        }

        await onEditorAssigned?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign editor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Assign Editor</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleAssign}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Select Editor</label>
            {loading ? (
              <div className="text-gray-600">Loading editors...</div>
            ) : (
              <select
                value={selectedEditorId}
                onChange={(e) => setSelectedEditorId(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">-- Select an editor --</option>
                {editors.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                    {ed.name} ({ed.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Raw video for the editor</label>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setSourceVideo(event.target.files?.[0] || null)}
              disabled={loading}
              className="w-full text-sm text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">Optional. The assigned editor can securely preview this source video.</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
