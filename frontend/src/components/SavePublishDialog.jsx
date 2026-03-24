import React, { useState } from "react";

/**
 * SavePublishDialog - Modal for saving/publishing mix after mixing
 * Appears after user finishes mixing
 * Options: Save to Library, Publish, or Export Only
 */
function SavePublishDialog({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [genre, setGenre] = useState("");
  const [action, setAction] = useState("save"); // 'save', 'publish', 'export'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        genre: genre.trim(),
        action,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setTags("");
      setGenre("");
      setAction("save");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setGenre("");
    setAction("save");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Save Your Mix</h2>
          <p className="text-gray-600 mt-1">
            Choose how you'd like to save your creation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Save Option
            </label>
            <div className="space-y-3">
              <label
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                style={{
                  borderColor: action === "save" ? "#3b82f6" : "#e5e7eb",
                }}
              >
                <input
                  type="radio"
                  value="save"
                  checked={action === "save"}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Save to Library</p>
                  <p className="text-sm text-gray-600">
                    Save as draft, edit anytime
                  </p>
                </div>
              </label>

              <label
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                style={{
                  borderColor: action === "publish" ? "#3b82f6" : "#e5e7eb",
                }}
              >
                <input
                  type="radio"
                  value="publish"
                  checked={action === "publish"}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">
                    Publish to Community
                  </p>
                  <p className="text-sm text-gray-600">
                    Share with other creators
                  </p>
                </div>
              </label>

              <label
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                style={{
                  borderColor: action === "export" ? "#3b82f6" : "#e5e7eb",
                }}
              >
                <input
                  type="radio"
                  value="export"
                  checked={action === "export"}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Export Only</p>
                  <p className="text-sm text-gray-600">Download, don't save</p>
                </div>
              </label>
            </div>
          </div>

          {action !== "export" && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter mix title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your mix (optional)"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a genre</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Jazz">Jazz</option>
                  <option value="R&B">R&B</option>
                  <option value="Soul">Soul</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags (e.g. vocal, upbeat, experimental)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : action === "export"
                  ? "Export"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SavePublishDialog;
