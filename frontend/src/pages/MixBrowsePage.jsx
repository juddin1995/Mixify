import React, { useEffect, useState, useCallback } from "react";
import { useDiscovery } from "../context/DiscoveryContext";
import discoveryService from "../services/discoveryService";
import MixCard from "../components/MixCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import TrendingSection from "../components/TrendingSection";

/**
 * MixBrowsePage - Community mix discovery and browsing
 * Features: browse, search, filter by genre, pagination
 */
function MixBrowsePage() {
  const {
    mixes,
    setMixes,
    isLoading,
    setIsLoading,
    error,
    setError,
    filters,
    setFilters,
    pagination,
    setPagination,
  } = useDiscovery();

  const [isSearching, setIsSearching] = useState(false);

  const loadPublishedMixes = useCallback(async (page = 1, genre = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discoveryService.getPublishedMixes({
        limit: 12,
        skip: (page - 1) * 12,
        genre: genre || filters.genre,
        tags: filters.tags.length > 0 ? filters.tags : null,
      });

      setMixes(result.mixes);
      setPagination({
        page: result.page,
        pages: result.pages,
        total: result.total,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters.tags, setMixes, setPagination, setIsLoading, setError, filters.genre]);

  // Load mixes when genre filter changes
  useEffect(() => {
    loadPublishedMixes(1, filters.genre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.genre]);

  // Load mixes when page changes
  useEffect(() => {
    if (pagination.page > 1) {
      loadPublishedMixes(pagination.page, filters.genre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleSearch = async (query) => {
    setIsSearching(true);
    setError(null);

    try {
      const results = await discoveryService.searchMixes(query);
      setMixes(results);
      setPagination({ page: 1, pages: 1, total: results.length });
      setFilters({ genre: null, tags: [], searchTerm: query });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenreChange = (genre) => {
    setFilters({ ...filters, genre });
    setPagination({ page: 1, pages: 1, total: 0 });
  };

  const handleReset = () => {
    setFilters({ genre: null, tags: [], searchTerm: "" });
    setPagination({ page: 1, pages: 1, total: 0 });
  };

  const handleEdit = (mixId) => {
    console.log("View mix details:", mixId);
    // TODO: Navigate to mix detail page
  };

  const handlePublish = (mixId) => {
    alert("Already published!");
  };

  const handleDelete = (mixId) => {
    alert("Cannot delete published mixes from this view");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Mixes
          </h1>
          <p className="text-gray-600">
            Explore mixes from our creative community
          </p>
        </div>

        {/* Trending Section */}
        <TrendingSection />

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isSearching} />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel
              selectedGenre={filters.genre}
              onGenreChange={handleGenreChange}
              onReset={handleReset}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="text-gray-600">Loading mixes...</div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && mixes.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 mb-4">
                  No mixes found{filters.genre && ` in ${filters.genre}`}
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Mixes Grid */}
            {!isLoading && mixes.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {mixes.map((mix) => (
                    <MixCard
                      key={mix._id}
                      mix={mix}
                      onEdit={handleEdit}
                      onPublish={handlePublish}
                      onDelete={handleDelete}
                      showActions={false}
                    />
                  ))}
                </div>

                {/* Stats */}
                <div className="text-center text-gray-600 mb-6">
                  Showing{" "}
                  <span className="font-semibold">
                    {(pagination.page - 1) * 12 + 1}-
                    {Math.min(pagination.page * 12, pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold">{pagination.total}</span>{" "}
                  mixes
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: Math.max(1, pagination.page - 1),
                        })
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center px-4 gap-2">
                      {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() =>
                            setPagination({
                              ...pagination,
                              page: i + 1,
                            })
                          }
                          className={`w-10 h-10 rounded transition ${
                            pagination.page === i + 1
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: Math.min(pagination.pages, pagination.page + 1),
                        })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MixBrowsePage;
