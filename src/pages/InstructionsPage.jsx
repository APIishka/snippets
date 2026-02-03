import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';
import ContentListLayout from '../components/ContentListLayout';
import UnifiedContentCard from '../components/UnifiedContentCard';
import ContentModal from '../components/ContentModal';

const InstructionsPage = () => {
  const navigate = useNavigate();
  const { colorScheme } = useSnippets();
  const theme = getThemeColors(colorScheme);
  const {
    filteredInstructions,
    instructionsLoading,
    instructionsError,
    instructionsTags,
    contentSearchQuery,
    setContentSearchQuery,
    contentSelectedTags,
    toggleContentTag,
    contentSortBy,
    setContentSortBy,
    instructions,
    isAuthenticated,
    isAuthLoading,
    fetchContent,
    deleteInstruction,
  } = useSnippets();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1419', color: '#e5e7eb' }}>
        <div className="text-center space-y-4">
          <p className="text-sm">Log in to view instructions.</p>
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
      await deleteInstruction(id);
      handleCloseModal();
    } catch (err) {
      alert(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.pageBackground, color: theme.textColor }}>
      <ContentListLayout
        searchPlaceholder="Search instructions, notes…"
        searchValue={contentSearchQuery}
        onSearchChange={setContentSearchQuery}
        tags={instructionsTags}
        selectedTags={contentSelectedTags}
        onToggleTag={toggleContentTag}
        sortBy={contentSortBy}
        onSortChange={setContentSortBy}
        loading={instructionsLoading}
        error={instructionsError}
        onRetry={() => fetchContent()}
        totalCount={instructions.length}
        filteredCount={filteredInstructions.length}
        emptyMessage="No instructions"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: theme.focusBorder, color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add instruction
          </button>
        </div>
        {filteredInstructions.length === 0 ? (
          <p className="text-sm py-8" style={{ color: '#8b949e' }}>No instructions found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInstructions.map((item) => (
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
        type="instruction"
        item={editingItem}
      />
    </div>
  );
};

export default InstructionsPage;
