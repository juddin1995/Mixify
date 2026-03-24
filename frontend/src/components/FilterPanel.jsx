import React from "react";

/**
 * FilterPanel - Genre and tag filtering component
 */
function FilterPanel({ selectedGenre, onGenreChange, onReset }) {
  const genres = [
    "Electronic",
    "Hip-Hop",
    "Pop",
    "Rock",
    "Jazz",
    "R&B",
    "Soul",
    "Other",
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      {/* Genre Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Genre
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onGenreChange(null)}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              selectedGenre === null
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                selectedGenre === genre
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
}

export default FilterPanel;
