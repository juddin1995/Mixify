import React, { createContext, useState } from 'react';

export const DiscoveryContext = createContext();

export function DiscoveryProvider({ children }) {
  const [mixes, setMixes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    genre: null,
    tags: [],
    searchTerm: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const value = {
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
  };

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = React.useContext(DiscoveryContext);
  if (!context) {
    throw new Error('useDiscovery must be used within DiscoveryProvider');
  }
  return context;
}
