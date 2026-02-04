import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import UnifiedContentCard from '../components/UnifiedContentCard';
import ContentModal from '../components/ContentModal';

const PromptsPage = () => {
  const navigate = useNavigate();
  const { colorScheme } = useSnippets();
  const theme = getThemeColors(colorScheme);
  const {
    filteredPrompts,
    promptsLoading,
    promptsError,
    promptsTags,
    promptsShowFavoritesOnly,
    setPromptsShowFavoritesOnly,
    promptsFavoritesCount,
    contentSearchQuery,
    setContentSearchQuery,
    contentSelectedTags,
    toggleContentTag,
    contentSortBy,
    setContentSortBy,
    prompts,
    isAuthenticated,
    isAuthLoading,
    fetchContent,
    deletePrompt,
  } = useSnippets();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1419', color: '#e5e7eb' }}>
        <div className="text-center space-y-4">
          <p className="text-sm">Log in to view prompts.</p>
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
      await deletePrompt(id);
      handleCloseModal();
    } catch (err) {
      alert(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.pageBackground, color: theme.textColor }}>
      <ContentListLayout
        searchPlaceholder="Search prompts, notes…"
        searchValue={contentSearchQuery}
        onSearchChange={setContentSearchQuery}
        tags={promptsTags}
        selectedTags={contentSelectedTags}
        onToggleTag={toggleContentTag}
        sortBy={contentSortBy}
        onSortChange={setContentSortBy}
        hideSort={true}
        showFavoritesOnly={promptsShowFavoritesOnly}
        onToggleFavorites={() => setPromptsShowFavoritesOnly(!promptsShowFavoritesOnly)}
        favoritesCount={promptsFavoritesCount}
        onClearFilters={() => setPromptsShowFavoritesOnly(false)}
        hideCountInFilterRow={true}
        filtersInModalOnMobile={true}
        filterModalOpen={filterModalOpen}
        onFilterModalOpenChange={setFilterModalOpen}
        loading={promptsLoading}
        error={promptsError}
        onRetry={() => fetchContent()}
        totalCount={prompts.length}
        filteredCount={filteredPrompts.length}
        theme="dark"
        emptyMessage="No prompts"
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
              {filteredPrompts.length} of {prompts.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add prompt
          </button>
        </div>
        {filteredPrompts.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No prompts found.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((item) => (
              <UnifiedContentCard
                key={item.id}
                item={item}
                contentType="prompt"
                title={item.text?.slice(0, 60) + (item.text?.length > 60 ? '…' : '') || 'Prompt'}
                languageLabel={null}
                bodyText={item.notes || ''}
                onEdit={handleEdit}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </ContentListLayout>
      <ContentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type="prompt"
        item={editingItem}
      />
    </div>
  );
};

export default PromptsPage;
