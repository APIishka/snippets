import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SnippetContext } from './snippetContext';

function mapRow(row) {
  return {
    ...row,
    dateAdded: row.date_added ?? row.dateAdded,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export const SnippetProvider = ({ children }) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [viewMode, setViewMode] = useState('grid');
  const [colorScheme, setColorScheme] = useState('ayu');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('snippetFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('snippetFavorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  }, [favorites]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fetchSnippets = useCallback(() => setRefreshTrigger(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('date_added', { ascending: false });
      if (cancelled) return;
      setLoading(false);
      if (error) {
        setFetchError(error.message);
        setSnippets([]);
        return;
      }
      setSnippets((data || []).map(mapRow));
    })();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loginWithPassword = useCallback(async (password) => {
    setLoginError(null);
    const email = import.meta.env.VITE_ADMIN_EMAIL;
    if (!email) {
      setLoginError('Admin email not configured (VITE_ADMIN_EMAIL)');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message || 'Invalid password');
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    setLoginError(null);
    await supabase.auth.signOut();
  }, []);

  const addSnippet = useCallback(async (payload) => {
    const { error } = await supabase.from('snippets').insert({
      title: payload.title,
      language: payload.language,
      tags: payload.tags || [],
      code: payload.code,
      notes: payload.notes || null,
      category: payload.category || null,
    });
    if (error) throw error;
    await fetchSnippets();
  }, [fetchSnippets]);

  const languages = useMemo(() => {
    const lang = [...new Set(snippets.map(s => s.language).filter(Boolean))].sort();
    return lang;
  }, [snippets]);

  const tags = useMemo(() => {
    return [...new Set(snippets.flatMap(s => s.tags || []))].sort();
  }, [snippets]);

  const categories = useMemo(() => {
    return [...new Set(snippets.map(s => s.category).filter(Boolean))].sort();
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    let filtered = [...snippets];

    if (showFavoritesOnly) {
      filtered = filtered.filter(s => favorites.includes(s.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q) ||
        (s.tags || []).some(t => String(t).toLowerCase().includes(q)) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q)
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(s => s.language === selectedLanguage);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(s =>
        selectedTags.every(tag => (s.tags || []).includes(tag))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title': return (a.title || '').localeCompare(b.title || '');
        case 'language': return (a.language || '').localeCompare(b.language || '');
        case 'dateAdded':
        default: return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      }
    });

    return filtered;
  }, [snippets, searchQuery, selectedLanguage, selectedTags, sortBy, showFavoritesOnly, favorites]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleFavorite = (snippetId) => {
    setFavorites(prev =>
      prev.includes(snippetId) ? prev.filter(id => id !== snippetId) : [...prev, snippetId]
    );
  };

  const isFavorite = (snippetId) => favorites.includes(snippetId);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedTags([]);
    setShowFavoritesOnly(false);
  };

  const value = {
    allSnippets: snippets,
    filteredSnippets,
    languages,
    tags,
    categories,
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
    favorites,
    toggleFavorite,
    isFavorite,
    colorScheme,
    setColorScheme,
    clearFilters,
    totalSnippets: snippets.length,
    filteredCount: filteredSnippets.length,
    favoritesCount: favorites.length,
    hasActiveSearch: searchQuery.trim().length > 0,

    loading,
    fetchError,
    fetchSnippets,
    isAuthenticated,
    isAuthLoading,
    loginError,
    loginWithPassword,
    logout,
    addSnippet,
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};
