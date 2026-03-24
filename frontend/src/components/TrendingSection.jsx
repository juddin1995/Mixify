import React, { useEffect, useState } from 'react';
import profileService from '../services/profileService';

/**
 * TrendingSection - Shows trending creators and popular mixes
 */
function TrendingSection() {
  const [trendingCreators, setTrendingCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingCreators();
  }, []);

  const loadTrendingCreators = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const creators = await profileService.getTrendingCreators(5);
      setTrendingCreators(creators);
    } catch (err) {
      setError(err.message);
      console.error('Error loading trending creators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
        <p className="text-gray-600">Loading trending creators...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-red-700">
        Error loading trending: {error}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Trending Creators</h2>

      {trendingCreators.length === 0 ? (
        <p className="text-gray-600">No trending creators yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingCreators.map((creator, idx) => (
            <div
              key={creator._id}
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl font-bold text-blue-500 mb-2">#{idx + 1}</div>
              <h4 className="font-semibold text-gray-900 truncate mb-3">
                {creator.name}
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{creator.totalMixes}</span> mixes
                </div>
                <div>
                  <span className="font-medium">{creator.totalLikes}</span> likes
                </div>
                <div>
                  <span className="font-medium">{creator.totalViews}</span> views
                </div>
              </div>
              <button className="w-full mt-4 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded transition font-medium">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrendingSection;
