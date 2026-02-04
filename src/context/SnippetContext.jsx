import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SnippetContext } from './snippetContext.js';
import { filterContentItems } from '../utils/contentFilter.jsx';

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

  // Admin-only content (words, text_snippets, prompts, instructions)
  const [words, setWords] = useState([]);
  const [textSnippets, setTextSnippets] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [contentRefreshTrigger, setContentRefreshTrigger] = useState(0);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsError, setWordsError] = useState(null);
  const [textSnippetsLoading, setTextSnippetsLoading] = useState(false);
  const [textSnippetsError, setTextSnippetsError] = useState(null);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState(null);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [instructionsError, setInstructionsError] = useState(null);

  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentSelectedTags, setContentSelectedTags] = useState([]);
  const [contentSortBy, setContentSortBy] = useState('dateAdded');
  const [wordsSelectedLanguage, setWordsSelectedLanguage] = useState('all');
  const [wordsShowFavoritesOnly, setWordsShowFavoritesOnly] = useState(false);
  const [textSnippetsShowFavoritesOnly, setTextSnippetsShowFavoritesOnly] = useState(false);

  const CONTENT_FAVORITES_KEY = 'contentFavorites';
  const [contentFavorites, setContentFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(CONTENT_FAVORITES_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o === 'object') {
          return {
            words: Array.isArray(o.words) ? o.words : [],
            textSnippets: Array.isArray(o.textSnippets) ? o.textSnippets : [],
            prompts: Array.isArray(o.prompts) ? o.prompts : [],
            instructions: Array.isArray(o.instructions) ? o.instructions : [],
          };
        }
      }
    } catch {
      // ignore parse error
    }
    return { words: [], textSnippets: [], prompts: [], instructions: [] };
  });

  useEffect(() => {
    try {
      localStorage.setItem(CONTENT_FAVORITES_KEY, JSON.stringify(contentFavorites));
    } catch (err) {
      console.error('Failed to save content favorites:', err);
    }
  }, [contentFavorites]);

  const toggleContentFavorite = useCallback((contentType, id) => {
    const key = contentType === 'text_snippet' ? 'textSnippets' : contentType + 's';
    setContentFavorites(prev => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter(x => x !== id)
        : [...prev[key], id],
    }));
  }, []);

  const isContentFavorite = useCallback((contentType, id) => {
    const key = contentType === 'text_snippet' ? 'textSnippets' : contentType + 's';
    return contentFavorites[key].includes(id);
  }, [contentFavorites]);

  const fetchContent = useCallback(() => setContentRefreshTrigger(t => t + 1), []);

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

  // Fetch admin content only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const clear = () => {
        setWords([]);
        setTextSnippets([]);
        setPrompts([]);
        setInstructions([]);
      };
      queueMicrotask(clear);
      return;
    }
    let cancelled = false;

    (async () => {
      setWordsLoading(true);
      setWordsError(null);
      const { data: wordsData, error: wordsErr } = await supabase
        .from('words')
        .select('*')
        .order('date_added', { ascending: false });
      if (!cancelled) {
        setWordsLoading(false);
        if (wordsErr) {
          setWordsError(wordsErr.message);
          setWords([]);
        } else {
          setWords((wordsData || []).map(mapRow));
        }
      }
    })();

    (async () => {
      setTextSnippetsLoading(true);
      setTextSnippetsError(null);
      const { data: tsData, error: tsErr } = await supabase
        .from('text_snippets')
        .select('*')
        .order('date_added', { ascending: false });
      if (!cancelled) {
        setTextSnippetsLoading(false);
        if (tsErr) {
          setTextSnippetsError(tsErr.message);
          setTextSnippets([]);
        } else {
          setTextSnippets((tsData || []).map(mapRow));
        }
      }
    })();

    (async () => {
      setPromptsLoading(true);
      setPromptsError(null);
      const { data: pData, error: pErr } = await supabase
        .from('prompts')
        .select('*')
        .order('date_added', { ascending: false });
      if (!cancelled) {
        setPromptsLoading(false);
        if (pErr) {
          setPromptsError(pErr.message);
          setPrompts([]);
        } else {
          setPrompts((pData || []).map(mapRow));
        }
      }
    })();

    (async () => {
      setInstructionsLoading(true);
      setInstructionsError(null);
      const { data: iData, error: iErr } = await supabase
        .from('instructions')
        .select('*')
        .order('date_added', { ascending: false });
      if (!cancelled) {
        setInstructionsLoading(false);
        if (iErr) {
          setInstructionsError(iErr.message);
          setInstructions([]);
        } else {
          setInstructions((iData || []).map(mapRow));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, contentRefreshTrigger]);

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

  const updateSnippet = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('snippets').update({
      title: payload.title,
      language: payload.language,
      tags: payload.tags || [],
      code: payload.code,
      notes: payload.notes || null,
      category: payload.category || null,
    }).eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No snippet found with the given ID to update.');
    }
    await fetchSnippets();
  }, [fetchSnippets]);

  const deleteSnippet = useCallback(async (id) => {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
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
        default: {
          // Ensure newest snippets appear first (at the top)
          const dateA = new Date(a.dateAdded || a.date_added || 0).getTime();
          const dateB = new Date(b.dateAdded || b.date_added || 0).getTime();
          return dateB - dateA; // Newest first (larger date - smaller date)
        }
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

  // Content filter (admin pages)
  const toggleContentTag = (tag) => {
    setContentSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const clearContentFilters = () => {
    setContentSearchQuery('');
    setContentSelectedTags([]);
    setContentSortBy('dateAdded');
    setWordsSelectedLanguage('all');
    setWordsShowFavoritesOnly(false);
  };

  const wordsTags = useMemo(() =>
    [...new Set(words.flatMap(w => w.tags || []))].sort(), [words]);
  const wordsLanguages = useMemo(() => {
    const langs = new Set();
    words.forEach((w) => {
      if (w.language_from) langs.add(w.language_from);
      if (w.language_to) langs.add(w.language_to);
    });
    return [...langs].sort();
  }, [words]);
  const textSnippetsTags = useMemo(() =>
    [...new Set(textSnippets.flatMap(t => t.tags || []))].sort(), [textSnippets]);
  const textSnippetsCategories = useMemo(() =>
    [...new Set(textSnippets.map(t => t.category).filter(Boolean))].sort(), [textSnippets]);
  const promptsTags = useMemo(() =>
    [...new Set(prompts.flatMap(p => p.tags || []))].sort(), [prompts]);
  const instructionsTags = useMemo(() =>
    [...new Set(instructions.flatMap(i => i.tags || []))].sort(), [instructions]);

  const filteredWords = useMemo(() => {
    let list = filterContentItems(words, {
      searchQuery: contentSearchQuery,
      searchFields: ['content', 'translation', 'notes'],
      selectedTags: contentSelectedTags,
      sortBy: contentSortBy,
      dateKey: 'date_added',
      textKey: 'content',
    });
    if (wordsSelectedLanguage !== 'all') {
      list = list.filter(
        (w) => w.language_from === wordsSelectedLanguage || w.language_to === wordsSelectedLanguage
      );
    }
    if (wordsShowFavoritesOnly) {
      const favIds = contentFavorites.words || [];
      list = list.filter((w) => favIds.includes(w.id));
    }
    return list;
  }, [words, contentSearchQuery, contentSelectedTags, contentSortBy, wordsSelectedLanguage, wordsShowFavoritesOnly, contentFavorites]);

  const filteredTextSnippets = useMemo(() => {
    let list = filterContentItems(textSnippets, {
      searchQuery: contentSearchQuery,
      searchFields: ['text', 'notes', 'category'],
      selectedTags: contentSelectedTags,
      sortBy: contentSortBy,
      dateKey: 'date_added',
      textKey: 'text',
    });
    if (textSnippetsShowFavoritesOnly) {
      const favIds = contentFavorites.textSnippets || [];
      list = list.filter((t) => favIds.includes(t.id));
    }
    return list;
  }, [textSnippets, contentSearchQuery, contentSelectedTags, contentSortBy, textSnippetsShowFavoritesOnly, contentFavorites]);

  const textSnippetsFavoritesCount = (contentFavorites.textSnippets || []).length;

  const filteredPrompts = useMemo(() => filterContentItems(prompts, {
    searchQuery: contentSearchQuery,
    searchFields: ['text', 'notes'],
    selectedTags: contentSelectedTags,
    sortBy: contentSortBy,
    dateKey: 'date_added',
    textKey: 'text',
  }), [prompts, contentSearchQuery, contentSelectedTags, contentSortBy]);

  const filteredInstructions = useMemo(() => filterContentItems(instructions, {
    searchQuery: contentSearchQuery,
    searchFields: ['text', 'notes'],
    selectedTags: contentSelectedTags,
    sortBy: contentSortBy,
    dateKey: 'date_added',
    textKey: 'text',
  }), [instructions, contentSearchQuery, contentSelectedTags, contentSortBy]);

  const addWord = useCallback(async (payload) => {
    const { error } = await supabase.from('words').insert({
      content: payload.content,
      translation: payload.translation || null,
      language_from: payload.language_from,
      language_to: payload.language_to,
      notes: payload.notes || null,
      tags: payload.tags || [],
    });
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const updateWord = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('words').update({
      content: payload.content,
      translation: payload.translation || null,
      language_from: payload.language_from,
      language_to: payload.language_to,
      notes: payload.notes || null,
      tags: payload.tags || [],
    }).eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Word not found.');
    fetchContent();
  }, [fetchContent]);

  const deleteWord = useCallback(async (id) => {
    const { error } = await supabase.from('words').delete().eq('id', id);
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const addTextSnippet = useCallback(async (payload) => {
    const { error } = await supabase.from('text_snippets').insert({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
      category: payload.category || null,
    });
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const updateTextSnippet = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('text_snippets').update({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
      category: payload.category || null,
    }).eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Text snippet not found.');
    fetchContent();
  }, [fetchContent]);

  const deleteTextSnippet = useCallback(async (id) => {
    const { error } = await supabase.from('text_snippets').delete().eq('id', id);
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const addPrompt = useCallback(async (payload) => {
    const { error } = await supabase.from('prompts').insert({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
    });
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const updatePrompt = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('prompts').update({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
    }).eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Prompt not found.');
    fetchContent();
  }, [fetchContent]);

  const deletePrompt = useCallback(async (id) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const addInstruction = useCallback(async (payload) => {
    const { error } = await supabase.from('instructions').insert({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
    });
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

  const updateInstruction = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('instructions').update({
      text: payload.text,
      language: payload.language || null,
      notes: payload.notes || null,
      tags: payload.tags || [],
    }).eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Instruction not found.');
    fetchContent();
  }, [fetchContent]);

  const deleteInstruction = useCallback(async (id) => {
    const { error } = await supabase.from('instructions').delete().eq('id', id);
    if (error) throw error;
    fetchContent();
  }, [fetchContent]);

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
    updateSnippet,
    deleteSnippet,

    words,
    filteredWords,
    wordsLoading,
    wordsError,
    wordsTags,
    wordsLanguages,
    wordsSelectedLanguage,
    setWordsSelectedLanguage,
    wordsShowFavoritesOnly,
    setWordsShowFavoritesOnly,
    addWord,
    updateWord,
    deleteWord,

    textSnippets,
    filteredTextSnippets,
    textSnippetsLoading,
    textSnippetsError,
    textSnippetsTags,
    textSnippetsCategories,
    textSnippetsShowFavoritesOnly,
    setTextSnippetsShowFavoritesOnly,
    textSnippetsFavoritesCount,
    addTextSnippet,
    updateTextSnippet,
    deleteTextSnippet,

    prompts,
    filteredPrompts,
    promptsLoading,
    promptsError,
    promptsTags,
    addPrompt,
    updatePrompt,
    deletePrompt,

    instructions,
    filteredInstructions,
    instructionsLoading,
    instructionsError,
    instructionsTags,
    addInstruction,
    updateInstruction,
    deleteInstruction,

    contentSearchQuery,
    setContentSearchQuery,
    contentSelectedTags,
    toggleContentTag,
    contentSortBy,
    setContentSortBy,
    clearContentFilters,
    fetchContent,
    contentFavorites,
    toggleContentFavorite,
    isContentFavorite,
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};
