import React, { createContext, useState } from "react";

export const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [mixes, setMixes] = useState([]);
  const [filteredMixes, setFilteredMixes] = useState([]);
  const [selectedTab, setSelectedTab] = useState("drafts"); // 'drafts', 'published', 'shared'
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const updateMixes = (newMixes) => {
    setMixes(newMixes);
  };

  const setTab = (tab) => {
    setSelectedTab(tab);
    setSearchQuery("");
    setPagination({ page: 1, pages: 1, total: 0 });
  };

  const value = {
    mixes,
    updateMixes,
    filteredMixes,
    setFilteredMixes,
    selectedTab,
    setTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    error,
    setError,
    pagination,
    setPagination,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = React.useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
}
