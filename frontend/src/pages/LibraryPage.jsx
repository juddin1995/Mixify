import React, { useEffect, useState, useCallback } from 'react';
import { useLibrary } from "../context/LibraryContext";
import mixService from "../services/mixService";
import MixCard from "../components/MixCard";

/**
 * LibraryPage - User's mix library
 * Shows drafts, published, and shared mixes
 */
function LibraryPage() {
  const {
    mixes,
    updateMixes,
    selectedTab,
    setTab,
    isLoading,
    setIsLoading,
    error,
    setError,
    pagination,
    setPagination,
  } = useLibrary();

  const [localError, setLocalError] = useState(null);

  const loadMixes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLocalError(null);

    try {
      let published = null;
      if (selectedTab === "published") {
        published = true;
      } else if (selectedTab === "drafts") {
        published = false;
      }

      const result = await mixService.getUserMixes({
        limit: 12,
        skip: (pagination.page - 1) * 12,
        published,
      });

      updateMixes(result.mixes);
      setPagination({
        page: result.page,
        pages: result.pages,
        total: result.total,
      });
    } catch (err) {
      setLocalError(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTab, pagination.page, updateMixes, setPagination, setIsLoading, setError]);

  useEffect(() => {
    loadMixes();
  }, [loadMixes]);

  const handleEdit = (mixId) => {
    // Navigate to edit page or open edit modal
    console.log("Edit mix:", mixId);
  };

  const handlePublish = async (mixId) => {
    try {
      setIsLoading(true);
      await mixService.publishMix(mixId);
      await loadMixes(); // Reload to reflect changes
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mixId) => {
    try {
      setIsLoading(true);
      await mixService.deleteMix(mixId);
      await loadMixes(); // Reload to reflect changes
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Mixes</h1>
          <p className="text-gray-600 mt-2">Manage your mix library</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {["drafts", "published", "shared"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                selectedTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {pagination.total > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({pagination.total})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">
            {localError || error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-gray-600">Loading mixes...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && mixes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No {selectedTab} mixes yet.</p>
            {selectedTab === "drafts" && (
              <a
                href="/mixer"
                className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Create Your First Mix
              </a>
            )}
          </div>
        )}

        {/* Mixes Grid */}
        {!isLoading && mixes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {mixes.map((mix) => (
                <MixCard
                  key={mix._id}
                  mix={mix}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                />
              ))}
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
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.min(pagination.pages, pagination.page + 1),
                    })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
