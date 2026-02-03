import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardPaste, FileEdit, Filter, Heart, Plus, X } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import ContentModal from '../components/ContentModal';
import MasonryWords from '../components/MasonryWords';

const WORDS_LANGUAGE_PAIR_KEY = 'wordsLanguagePair';
const LANGUAGE_PAIR_OPTIONS = [
  { value: 'en_ru', from: 'en', to: 'ru', label: 'en–ru' },
  { value: 'cz_ru', from: 'cz', to: 'ru', label: 'cz–ru' },
  { value: 'cz_en', from: 'cz', to: 'en', label: 'cz–en' },
];

function loadLanguagePair() {
  try {
    const raw = localStorage.getItem(WORDS_LANGUAGE_PAIR_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.from === 'string' && typeof p.to === 'string') {
        const opt = LANGUAGE_PAIR_OPTIONS.find((o) => o.from === p.from && o.to === p.to);
        if (opt) return { from: opt.from, to: opt.to };
      }
    }
  } catch (_) {}
  return { from: 'en', to: 'ru' };
}

function saveLanguagePair(from, to) {
  try {
    localStorage.setItem(WORDS_LANGUAGE_PAIR_KEY, JSON.stringify({ from, to }));
  } catch (_) {}
}

function QuickAddWord({ languageFrom, languageTo, onAdd, onAddSuccess, theme, className = '' }) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const translationRef = useRef(null);

  const handlePasteWord = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed) {
        setWord(trimmed);
        setError(null);
        setTimeout(() => translationRef.current?.focus(), 50);
      }
    } catch (_) {
      setError('Could not read clipboard');
    }
  };

  const handlePasteTranslation = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text !== undefined) setTranslation(String(text).trim());
      setError(null);
    } catch (_) {
      setError('Could not read clipboard');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const content = (word || '').trim();
    if (!content) {
      setError('Enter a word or phrase.');
      return;
    }
    setError(null);
    setAdding(true);
    try {
      await onAdd({
        content,
        translation: (translation || '').trim() || null,
        language_from: languageFrom,
        language_to: languageTo,
        notes: null,
        tags: [],
      });
      setWord('');
      setTranslation('');
      onAddSuccess?.();
    } catch (err) {
      setError(err?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const btnStyle = { background: theme.inputBackground, borderColor: theme.inputBorder };

  return (
    <form onSubmit={handleSubmit} className={`w-full flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 ${className}`}>
      <div className="flex flex-1 min-w-0 w-full sm:min-w-[8rem] items-center gap-1 rounded border px-2 py-1.5" style={{ ...btnStyle, borderColor: theme.inputBorder }}>
        <input
          type="text"
          value={word}
          onChange={(e) => { setWord(e.target.value); setError(null); }}
          placeholder="Word / phrase"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm focus:outline-none"
          style={{ color: theme.textColor }}
          disabled={adding}
        />
        <button type="button" onClick={handlePasteWord} className="rounded p-1 cursor-pointer hover:opacity-80" style={{ color: theme.buttonText }} title="Paste word">
          <ClipboardPaste className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-1 min-w-0 w-full sm:min-w-[8rem] items-center gap-1 rounded border px-2 py-1.5" style={{ ...btnStyle, borderColor: theme.inputBorder }}>
        <input
          ref={translationRef}
          type="text"
          value={translation}
          onChange={(e) => { setTranslation(e.target.value); setError(null); }}
          placeholder="Translation (optional)"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm focus:outline-none"
          style={{ color: theme.textColor }}
          disabled={adding}
        />
        <button type="button" onClick={handlePasteTranslation} className="rounded p-1 cursor-pointer hover:opacity-80" style={{ color: theme.buttonText }} title="Paste translation">
          <ClipboardPaste className="w-3.5 h-3.5" />
        </button>
      </div>
      <button
        type="submit"
        disabled={adding || !(word || '').trim()}
        className="shrink-0 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        style={{ background: theme.focusBorder, color: '#fff' }}
      >
        {adding ? '…' : 'Add'}
      </button>
      {error && <span className="w-full shrink-0 text-xs sm:w-auto" style={{ color: '#ef4444' }}>{error}</span>}
    </form>
  );
}

const WordsPage = () => {
  const navigate = useNavigate();
  const {
    filteredWords,
    wordsLoading,
    wordsError,
    wordsLanguages,
    wordsSelectedLanguage,
    setWordsSelectedLanguage,
    wordsShowFavoritesOnly,
    setWordsShowFavoritesOnly,
    contentSearchQuery,
    setContentSearchQuery,
    contentSortBy,
    setContentSortBy,
    words,
    isAuthenticated,
    isAuthLoading,
    fetchContent,
    addWord,
    deleteWord,
    colorScheme,
    contentFavorites,
  } = useSnippets();

  const [languagePair, setLanguagePair] = useState(loadLanguagePair);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const theme = getThemeColors(colorScheme);
  const wordsFavoritesCount = contentFavorites?.words?.length ?? 0;

  useEffect(() => {
    saveLanguagePair(languagePair.from, languagePair.to);
  }, [languagePair.from, languagePair.to]);

  const pairValue = LANGUAGE_PAIR_OPTIONS.some((o) => o.from === languagePair.from && o.to === languagePair.to)
    ? `${languagePair.from}_${languagePair.to}`
    : 'en_ru';

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.pageBackground, color: theme.textColor }}>
        <div className="text-center space-y-4">
          <p className="text-sm">Log in to view words.</p>
          <button
            type="button"
            onClick={() => navigate('/snippets')}
            className="px-4 py-2 rounded text-sm"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            Back to Snippets
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  const handleOpenFullModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const accent = theme.focusBorder;
  const pageBg = theme.pageBackground;
  const border = theme.inputBorder;
  const text = theme.textColor;

  const filterButton = (
    <button
      type="button"
      onClick={() => setFilterModalOpen(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border cursor-pointer hover:opacity-90"
      style={{ background: pageBg, borderColor: border, color: text }}
    >
      <Filter className="w-4 h-4" />
      Filter
    </button>
  );

  const inlineFilterChips = (
    <div className="hidden md:flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setWordsSelectedLanguage('all')}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${wordsSelectedLanguage === 'all' ? '' : 'border'}`}
        style={
          wordsSelectedLanguage === 'all'
            ? { background: accent, color: '#fff' }
            : { background: pageBg, borderColor: border, color: text }
        }
      >
        All
      </button>
      <button
        type="button"
        onClick={() => setWordsShowFavoritesOnly((v) => !v)}
        className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer ${wordsShowFavoritesOnly ? '' : 'border'}`}
        style={
          wordsShowFavoritesOnly
            ? { background: '#ef4444', color: '#fff' }
            : { background: pageBg, borderColor: border, color: text }
        }
      >
        <Heart className="w-3.5 h-3.5 shrink-0" fill={wordsShowFavoritesOnly ? '#fff' : 'none'} />
        Favorites
        {wordsFavoritesCount > 0 && ` (${wordsFavoritesCount})`}
      </button>
      {wordsLanguages.map((lang) => {
        const selected = wordsSelectedLanguage === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setWordsSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${selected ? '' : 'border'}`}
            style={
              selected
                ? { background: accent, color: '#fff' }
                : { background: pageBg, borderColor: border, color: text }
            }
          >
            {lang}
          </button>
        );
      })}
    </div>
  );

  const filterModalContent = (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        onClick={() => setWordsSelectedLanguage('all')}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${wordsSelectedLanguage === 'all' ? '' : 'border'}`}
        style={
          wordsSelectedLanguage === 'all'
            ? { background: accent, color: '#fff' }
            : { background: pageBg, borderColor: border, color: text }
        }
      >
        All
      </button>
      <button
        type="button"
        onClick={() => setWordsShowFavoritesOnly((v) => !v)}
        className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center gap-1.5 cursor-pointer ${wordsShowFavoritesOnly ? '' : 'border'}`}
        style={
          wordsShowFavoritesOnly
            ? { background: '#ef4444', color: '#fff' }
            : { background: pageBg, borderColor: border, color: text }
        }
      >
        <Heart className="w-3.5 h-3.5 shrink-0" fill={wordsShowFavoritesOnly ? '#fff' : 'none'} />
        Favorites
        {wordsFavoritesCount > 0 && ` (${wordsFavoritesCount})`}
      </button>
      {wordsLanguages.map((lang) => {
        const selected = wordsSelectedLanguage === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setWordsSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${selected ? '' : 'border'}`}
            style={
              selected
                ? { background: accent, color: '#fff' }
                : { background: pageBg, borderColor: border, color: text }
            }
          >
            {lang}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: theme.pageBackground, color: theme.textColor }}>
      <ContentListLayout
        searchPlaceholder="Search words, translation, notes…"
        searchValue={contentSearchQuery}
        onSearchChange={setContentSearchQuery}
        tags={[]}
        selectedTags={[]}
        sortBy={contentSortBy}
        onSortChange={setContentSortBy}
        loading={wordsLoading}
        error={wordsError}
        onRetry={() => fetchContent()}
        totalCount={words.length}
        filteredCount={filteredWords.length}
        emptyMessage="No words"
        extraFilters={
          <>
            <div className="md:hidden">{filterButton}</div>
            {inlineFilterChips}
          </>
        }
      >
        <div className="mb-5 w-full flex flex-row flex-wrap items-center gap-2 md:gap-3">
          <select
            value={pairValue}
            onChange={(e) => {
              const opt = LANGUAGE_PAIR_OPTIONS.find((o) => o.value === e.target.value);
              if (opt) setLanguagePair({ from: opt.from, to: opt.to });
            }}
            className="rounded border px-2 py-1.5 text-xs focus:outline-none w-[72px] shrink-0"
            style={{ background: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textColor }}
          >
            {LANGUAGE_PAIR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="hidden md:flex flex-1 min-w-0 w-full">
            <QuickAddWord
              languageFrom={languagePair.from}
              languageTo={languagePair.to}
              onAdd={addWord}
              onAddSuccess={() => fetchContent()}
              theme={theme}
            />
          </div>
          <div className="flex flex-1 min-w-0 md:flex-initial items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickAddModalOpen(true)}
              className="md:hidden flex flex-1 min-w-0 justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:opacity-90"
              style={{ background: theme.focusBorder, color: '#fff' }}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={handleOpenFullModal}
              className="flex shrink-0 items-center justify-center rounded-lg p-2 md:p-2.5 border cursor-pointer hover:opacity-90 transition-colors"
              style={{ background: theme.inputBackground, borderColor: theme.inputBorder, color: theme.buttonText }}
              title="Add with all fields"
            >
              <FileEdit className="w-4 h-4" />
            </button>
          </div>
        </div>
        {filteredWords.length === 0 ? (
          <p className="py-6 text-sm" style={{ color: theme.buttonText }}>No words found.</p>
        ) : (
          <MasonryWords
            words={filteredWords}
            onEdit={handleEdit}
            isAuthenticated={isAuthenticated}
          />
        )}
      </ContentListLayout>
      <ContentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type="word"
        item={editingItem}
        initialLanguageFrom={languagePair.from}
        initialLanguageTo={languagePair.to}
      />

      {quickAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setQuickAddModalOpen(false)}
          role="presentation"
        >
          <div
            className="rounded-lg border w-full max-w-md shadow-xl p-4"
            style={{ background: theme.pageBackground, borderColor: theme.inputBorder, color: theme.textColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Quick add word</h3>
              <button
                type="button"
                onClick={() => setQuickAddModalOpen(false)}
                className="p-1 rounded hover:opacity-80"
                style={{ color: theme.buttonText }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <QuickAddWord
              languageFrom={languagePair.from}
              languageTo={languagePair.to}
              onAdd={addWord}
              onAddSuccess={() => { fetchContent(); setQuickAddModalOpen(false); }}
              theme={theme}
            />
          </div>
        </div>
      )}

      {filterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setFilterModalOpen(false)}
          role="presentation"
        >
          <div
            className="rounded-lg border w-full max-w-md shadow-xl p-4"
            style={{ background: theme.pageBackground, borderColor: theme.inputBorder, color: theme.textColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Filter</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded hover:opacity-80"
                style={{ color: theme.buttonText }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterModalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsPage;
