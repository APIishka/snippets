import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import UnifiedContentCard from '../components/UnifiedContentCard';
import ContentModal from '../components/ContentModal';

const TextSnippetsPage = () => {
  const navigate = useNavigate();
  const {
    filteredTextSnippets,
    textSnippetsLoading,
    textSnippetsError,
    textSnippetsTags,
    textSnippetsCategories,
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
  } = useSnippets();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
        loading={textSnippetsLoading}
        error={textSnippetsError}
        onRetry={() => fetchContent()}
        totalCount={textSnippets.length}
        filteredCount={itemsToShow.length}
        theme="dark"
        emptyMessage="No text snippets"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add snippet
          </button>
        </div>
        {itemsToShow.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No text snippets found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itemsToShow.map((item) => (
              <UnifiedContentCard
                key={item.id}
                item={item}
                contentType="text_snippet"
                title={item.text?.slice(0, 60) + (item.text?.length > 60 ? '…' : '')}
                languageLabel={item.category || item.language || null}
                bodyText={item.text || ''}
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
        type="text_snippet"
        item={editingItem}
      />
    </div>
  );
};

export default TextSnippetsPage;
