import { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ayuDarkTheme, vsCodeDarkTheme, githubLightTheme } from '../utils/colorSchemes';

const LANGUAGES = [
  'javascript',
  'python',
  'typescript',
  'java',
  'rust',
  'go',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'cpp',
  'html',
  'css',
  'txt',
  'other'
];

const AddSnippetModal = ({ isOpen, onClose, onSuccess, snippet: editingSnippet, onDelete }) => {
  const { addSnippet, updateSnippet, colorScheme } = useSnippets();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const modalRef = useRef(null);
  const isEditMode = !!editingSnippet;

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingSnippet) {
      setTitle(editingSnippet.title || '');
      setLanguage(editingSnippet.language || 'javascript');
      setCode(editingSnippet.code || '');
      setTagsStr((editingSnippet.tags || []).join(', '));
      setNotes(editingSnippet.notes || '');
      setCategory(editingSnippet.category || '');
    } else if (isOpen && !editingSnippet) {
      // Reset form for new snippet
      setTitle('');
      setLanguage('javascript');
      setCode('');
      setTagsStr('');
      setNotes('');
      setCategory('');
    }
  }, [isOpen, editingSnippet]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getTheme = () => {
    switch (colorScheme) {
      case 'ayu': return ayuDarkTheme;
      case 'vscode': return vsCodeDarkTheme;
      case 'light': return githubLightTheme;
      default: return ayuDarkTheme;
    }
  };

  const getBgColor = () => {
    switch (colorScheme) {
      case 'ayu': return '#0f1419';
      case 'vscode': return '#1E1E1E';
      case 'light': return '#ffffff';
      default: return '#0f1419';
    }
  };

  const isLight = colorScheme === 'light';
  const bg = getBgColor();
  const modalBg = isLight ? '#ffffff' : (colorScheme === 'ayu' ? '#0f1419' : '#1E1E1E');
  const border = isLight ? '#d1d9e0' : (colorScheme === 'ayu' ? '#1a1f2e' : '#2d2d2d');
  const text = isLight ? '#24292f' : (colorScheme === 'ayu' ? '#d0d0d0' : '#e5e7eb');
  const muted = isLight ? '#656d76' : (colorScheme === 'ayu' ? '#828C99' : '#8b949e');
  const accent = isLight ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const inputBg = isLight ? '#f6f8fa' : (colorScheme === 'ayu' ? '#0f1419' : '#252526');
  const overlayBg = isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.7)';
  const placeholderColor = isLight ? 'rgba(36, 41, 47, 0.25)' : (colorScheme === 'ayu' ? 'rgba(130, 140, 153, 0.4)' : 'rgba(229, 231, 235, 0.25)');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!title.trim() || !code.trim()) {
      setSubmitError('Title and code are required.');
      return;
    }
    setSubmitting(true);
    try {
      const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { 
        title: title.trim(), 
        language, 
        tags, 
        code: code.trim(), 
        notes: notes.trim() || null, 
        category: category.trim() || null 
      };
      
      if (isEditMode && editingSnippet && editingSnippet.id) {
        await updateSnippet(editingSnippet.id, payload);
      } else {
        await addSnippet(payload);
      }
      
      setTitle('');
      setCode('');
      setTagsStr('');
      setNotes('');
      setCategory('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err?.message || (isEditMode ? 'Failed to update snippet.' : 'Failed to add snippet.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-input::placeholder {
          color: ${placeholderColor} !important;
          opacity: 1;
          font-size: 0.8125rem;
        }
        .code-textarea {
          min-height: 250px;
        }
        @media (min-width: 768px) {
          .code-textarea {
            min-height: 400px;
          }
        }
      `}</style>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      style={{ background: overlayBg }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="scrollbar-subtle w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{ 
          background: modalBg,
          border: `1px solid ${border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-3 py-3 md:px-5 md:py-4 border-b" style={{ borderColor: border, background: modalBg, zIndex: 10 }}>
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-base md:text-lg font-semibold" style={{ color: text }}>
              {isEditMode ? 'Edit Snippet' : 'Add New Snippet'}
            </h2>
            {isEditMode && onDelete && editingSnippet && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
                    onDelete(editingSnippet.id);
                    onClose();
                  }
                }}
                className="p-1.5 md:p-2 rounded transition-colors cursor-pointer hover:opacity-70"
                style={{ color: '#ef4444' }}
                aria-label="Delete snippet"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 md:p-1.5 rounded transition-colors cursor-pointer hover:opacity-70"
            style={{ color: muted }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 md:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3 md:gap-5">
            {/* Left: Code Editor */}
            <div className="space-y-2 md:space-y-3">
              <label className="block text-xs md:text-sm font-medium" style={{ color: text }}>Code *</label>
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste or type your code snippet here..."
                  rows={12}
                  spellCheck={false}
                  className="modal-input code-textarea w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none resize-y transition-colors md:py-2.5"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
                {code.trim() && (
                  <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: border }}>
                    <SyntaxHighlighter
                      language={language === 'other' || language === 'txt' ? 'text' : language}
                      style={getTheme()}
                      showLineNumbers={false}
                      wrapLines={true}
                      wrapLongLines={true}
                      customStyle={{
                        margin: 0,
                        padding: '0.75rem',
                        background: bg,
                        fontSize: '0.8125rem',
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
                        }
                      }}
                      PreTag="div"
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="space-y-2 md:space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-1.5" style={{ color: text }}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Descriptive title"
                  spellCheck={false}
                  className="modal-input w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-1.5" style={{ color: text }}>Language *</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors cursor-pointer"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-1.5" style={{ color: text }}>Tags</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Comma-separated tags"
                  spellCheck={false}
                  className="modal-input w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-1.5" style={{ color: text }}>Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category name"
                  spellCheck={false}
                  className="modal-input w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-1.5" style={{ color: text }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or context"
                  rows={4}
                  spellCheck={false}
                  className="modal-input w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-y transition-colors"
                  style={{ 
                    background: inputBg, 
                    borderColor: border, 
                    color: text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = accent}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
              </div>

              {submitError && (
                <div className="p-2.5 rounded-lg" style={{ background: isLight ? '#fff1f2' : '#3f1f1f', border: `1px solid ${isLight ? '#ff8182' : '#ef4444'}` }}>
                  <p className="text-xs" style={{ color: '#ef4444' }}>{submitError}</p>
                </div>
              )}

              <div className="flex gap-2 md:gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer"
                  style={{ 
                    background: inputBg, 
                    border: `1px solid ${border}`, 
                    color: text 
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: accent, color: '#fff' }}
                >
                  {submitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default AddSnippetModal;
