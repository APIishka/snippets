import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
        loading={promptsLoading}
        error={promptsError}
        onRetry={() => fetchContent()}
        totalCount={prompts.length}
        filteredCount={filteredPrompts.length}
        theme="dark"
        emptyMessage="No prompts"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add prompt
          </button>
        </div>
        {filteredPrompts.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No prompts found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                primaryKey="text"
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAuthenticated={isAuthenticated}
                theme="dark"
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
