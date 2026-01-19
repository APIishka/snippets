import { createContext, useContext, useState, useMemo, useEffect } from 'react';
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
  const [colorScheme, setColorScheme] = useState('ayu'); // ayu, vscode, light
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load favorites from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('snippetFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('snippetFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  // Get all available filters
  const languages = useMemo(() => getAllLanguages(), []);
  const tags = useMemo(() => getAllTags(), []);
  const categories = useMemo(() => getAllCategories(), []);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = [...snippets];

    // Apply favorites filter first
    if (showFavoritesOnly) {
      filtered = filtered.filter(snippet => favorites.includes(snippet.id));
    }

    // Apply search query - search in title, notes, tags, category, AND code content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.notes.toLowerCase().includes(query) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
        snippet.category.toLowerCase().includes(query) ||
        snippet.code.toLowerCase().includes(query) // Search in code content like VS Code
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
  }, [searchQuery, selectedLanguage, selectedTags, sortBy, showFavoritesOnly, favorites]);

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Toggle favorite
  const toggleFavorite = (snippetId) => {
    setFavorites(prev =>
      prev.includes(snippetId)
        ? prev.filter(id => id !== snippetId)
        : [...prev, snippetId]
    );
  };

  // Check if snippet is favorite
  const isFavorite = (snippetId) => {
    return favorites.includes(snippetId);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedTags([]);
    setShowFavoritesOnly(false);
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
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,

    // Theme
    colorScheme,
    setColorScheme,

    // Actions
    clearFilters,

    // Stats
    totalSnippets: snippets.length,
    filteredCount: filteredSnippets.length,
    favoritesCount: favorites.length,

    // Search highlighting
    hasActiveSearch: searchQuery.trim().length > 0,
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};
