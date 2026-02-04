import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import MasonryTextSnippets from '../components/MasonryTextSnippets';
import ContentModal from '../components/ContentModal';

const TextSnippetsPage = () => {
  const navigate = useNavigate();
  const {
    filteredTextSnippets,
    textSnippetsLoading,
    textSnippetsError,
    textSnippetsTags,
    textSnippetsCategories,
    textSnippetsShowFavoritesOnly,
    setTextSnippetsShowFavoritesOnly,
    textSnippetsFavoritesCount,
    contentSearchQuery,
    setContentSearchQuery,
    contentSelectedTags,
    toggleContentTag,
    contentSortBy,
    setContentSortBy,
    textSnippets,
    isAuthenticated,
    isAuthLoading,
    fetchContent,
    deleteTextSnippet,
    colorScheme,
  } = useSnippets();

  const theme = getThemeColors(colorScheme);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const itemsToShow = useMemo(() => {
    if (!selectedCategory) return filteredTextSnippets;
    return filteredTextSnippets.filter((t) => t.category === selectedCategory);
  }, [filteredTextSnippets, selectedCategory]);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1419', color: '#e5e7eb' }}>
        <div className="text-center space-y-4">
          <p className="text-sm">Log in to view text snippets.</p>
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
      await deleteTextSnippet(id);
      handleCloseModal();
    } catch (err) {
      alert(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.pageBackground, color: theme.textColor }}>
      <ContentListLayout
        searchPlaceholder="Search text, notes, category…"
        searchValue={contentSearchQuery}
        onSearchChange={setContentSearchQuery}
        tags={textSnippetsTags}
        selectedTags={contentSelectedTags}
        onToggleTag={toggleContentTag}
        sortBy={contentSortBy}
        onSortChange={setContentSortBy}
        categories={textSnippetsCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryAsDropdown={false}
        showFavoritesOnly={textSnippetsShowFavoritesOnly}
        onToggleFavorites={() => setTextSnippetsShowFavoritesOnly(!textSnippetsShowFavoritesOnly)}
        favoritesCount={textSnippetsFavoritesCount}
        hideSort={true}
        filtersInModalOnMobile={true}
        filterModalOpen={filterModalOpen}
        onFilterModalOpenChange={setFilterModalOpen}
        hideCountInFilterRow={true}
        loading={textSnippetsLoading}
        error={textSnippetsError}
        onRetry={() => fetchContent()}
        totalCount={textSnippets.length}
        filteredCount={itemsToShow.length}
        theme="dark"
        emptyMessage="No text snippets"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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
              {itemsToShow.length} of {textSnippets.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add message
          </button>
        </div>
        {itemsToShow.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No text snippets found.</p>
        ) : (
          <MasonryTextSnippets
            items={itemsToShow}
            onEdit={handleEdit}
            isAuthenticated={isAuthenticated}
          />
        )}
      </ContentListLayout>
      <ContentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type="text_snippet"
        item={editingItem}
      />
    </div>
  );
};

export default TextSnippetsPage;
