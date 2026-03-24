import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LibraryProvider } from "./context/LibraryContext";
import { DiscoveryProvider } from "./context/DiscoveryContext";
import Navigation from "./components/Navigation";
import NewMixPage from "./pages/NewMixPage";
import LibraryPage from "./pages/LibraryPage";
import MixBrowsePage from "./pages/MixBrowsePage";

function App() {
  return (
    <Router>
      <LibraryProvider>
        <DiscoveryProvider>
          <Navigation />
          <Routes>
            <Route path="/mixer" element={<NewMixPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/discover" element={<MixBrowsePage />} />
            <Route path="/" element={<Navigate to="/mixer" replace />} />
          </Routes>
        </DiscoveryProvider>
      </LibraryProvider>
    </Router>
  );
}

export default App;
