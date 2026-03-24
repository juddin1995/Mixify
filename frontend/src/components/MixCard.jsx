import React, { useState } from "react";

/**
 * MixCard - Reusable mix preview card
 * Shows mix info with action buttons
 */
function MixCard({ mix, onEdit, onPublish, onDelete, showActions = true }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    if (window.confirm("Publish this mix to the community?")) {
      setIsLoading(true);
      try {
        await onPublish(mix._id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      setIsLoading(true);
      try {
        await onDelete(mix._id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {mix.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {mix.description || "No description"}
            </p>
          </div>
          {mix.isPublished && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
              Published
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div>
            <span className="font-semibold">Genre:</span> {mix.genre || "—"}
          </div>
          <div>
            <span className="font-semibold">Duration:</span> {mix.duration}s
          </div>
          {mix.isPublished && (
            <>
              <div>
                <span className="font-semibold">Views:</span> {mix.viewCount}
              </div>
              <div>
                <span className="font-semibold">Likes:</span> {mix.likeCount}
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {mix.tags && mix.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mix.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex border-t border-gray-200 divide-x divide-gray-200">
          <button
            onClick={() => onEdit(mix._id)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
          >
            Edit
          </button>
          {!mix.isPublished && (
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition disabled:opacity-50"
            >
              {isLoading ? "Publishing..." : "Publish"}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

export default MixCard;
