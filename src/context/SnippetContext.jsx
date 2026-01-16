import { createContext, useContext, useState, useMemo } from 'react';
import snippets, { getAllLanguages, getAllTags, getAllCategories } from '../snippets';

const SnippetContext = createContext();

export const useSnippets = () => {
  const context = useContext(SnippetContext);
  if (!context) {
    throw new Error('useSnippets must be used within SnippetProvider');
  }
  return context;
};

export const SnippetProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, title, language
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Get all available filters
  const languages = useMemo(() => getAllLanguages(), []);
  const tags = useMemo(() => getAllTags(), []);
  const categories = useMemo(() => getAllCategories(), []);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = [...snippets];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.notes.toLowerCase().includes(query) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
        snippet.category.toLowerCase().includes(query)
      );
    }

    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(snippet => snippet.language === selectedLanguage);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(snippet =>
        selectedTags.every(tag => snippet.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'language':
          return a.language.localeCompare(b.language);
        case 'dateAdded':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    return filtered;
  }, [searchQuery, selectedLanguage, selectedTags, sortBy]);

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedTags([]);
  };

  const value = {
    // Data
    allSnippets: snippets,
    filteredSnippets,
    languages,
    tags,
    categories,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    selectedTags,
    toggleTag,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,

    // Actions
    clearFilters,

    // Stats
    totalSnippets: snippets.length,
    filteredCount: filteredSnippets.length,
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};
