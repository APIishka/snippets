import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import MasonryTextSnippets from '../components/MasonryTextSnippets';
import ContentModal from '../components/ContentModal';

const TalkPage = () => {
  const navigate = useNavigate();
  const {
    filteredTalk,
    talkLoading,
    talkError,
    talkTags,
    talkLanguages,
    talkSelectedLanguage,
    setTalkSelectedLanguage,
    talkShowFavoritesOnly,
    setTalkShowFavoritesOnly,
    talkFavoritesCount,
    contentSearchQuery,
    setContentSearchQuery,
    contentSelectedTags,
    toggleContentTag,
    contentSortBy,
    setContentSortBy,
    talk,
    isAuthenticated,
    isAuthLoading,
    fetchContent,
    deleteTalk,
    colorScheme,
  } = useSnippets();

  const theme = getThemeColors(colorScheme);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1419', color: '#e5e7eb' }}>
        <div className="text-center space-y-4">
          <p className="text-sm">Log in to view talk.</p>
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
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };
  const handleDelete = async (id) => {
    try {
      await deleteTalk(id);
      handleCloseModal();
    } catch (err) {
      alert(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.pageBackground, color: theme.textColor }}>
      <ContentListLayout
        searchPlaceholder="Search text, notes…"
        searchValue={contentSearchQuery}
        onSearchChange={setContentSearchQuery}
        tags={talkTags}
        selectedTags={contentSelectedTags}
        onToggleTag={toggleContentTag}
        sortBy={contentSortBy}
        onSortChange={setContentSortBy}
        showFavoritesOnly={talkShowFavoritesOnly}
        onToggleFavorites={() => setTalkShowFavoritesOnly(!talkShowFavoritesOnly)}
        favoritesCount={talkFavoritesCount}
        onClearFilters={() => {
          setTalkShowFavoritesOnly(false);
          setTalkSelectedLanguage('all');
        }}
        filterLanguages={talkLanguages}
        filterSelectedLanguage={talkSelectedLanguage}
        onFilterLanguageChange={setTalkSelectedLanguage}
        hideSort={true}
        filtersInModalOnMobile={true}
        filterModalOpen={filterModalOpen}
        onFilterModalOpenChange={setFilterModalOpen}
        hideCountInFilterRow={true}
        loading={talkLoading}
        error={talkError}
        onRetry={() => fetchContent()}
        totalCount={talk.length}
        filteredCount={filteredTalk.length}
        theme="dark"
        emptyMessage="No talk"
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border cursor-pointer hover:opacity-90 shrink-0"
              style={{ background: theme.pageBackground, borderColor: theme.inputBorder, color: theme.textColor }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <span className="text-xs tabular-nums shrink-0 md:px-4" style={{ color: theme.buttonText }}>
              {filteredTalk.length} of {talk.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add talk
          </button>
        </div>
        {filteredTalk.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No talk found.</p>
        ) : (
          <MasonryTextSnippets
            items={filteredTalk}
            onEdit={handleEdit}
            isAuthenticated={isAuthenticated}
            contentType="talk"
          />
        )}
      </ContentListLayout>
      <ContentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type="talk"
        item={editingItem}
      />
    </div>
  );
};

export default TalkPage;
