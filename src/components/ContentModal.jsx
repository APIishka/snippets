import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';

const WORD_LANGUAGES = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'uk', 'cz', 'ja', 'zh', 'ar'];

/**
 * Shared modal for add/edit of words, text_snippets, prompts, instructions.
 * Renders fields by type; calls context add/update/delete.
 */
const FIELD_CONFIG = {
  word: [
    { key: 'content', label: 'Word / phrase', type: 'textarea', required: true },
    { key: 'translation', label: 'Translation', type: 'textarea' },
    { key: 'language_from', label: 'From language', type: 'select', options: WORD_LANGUAGES, required: true },
    { key: 'language_to', label: 'To language', type: 'select', options: WORD_LANGUAGES, required: true },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
  ],
  text_snippet: [
    { key: 'text', label: 'Text', type: 'textarea', required: true },
    { key: 'language', label: 'Language', type: 'select', options: WORD_LANGUAGES },
    { key: 'category', label: 'Category', type: 'select', optionsKey: 'textSnippetsCategories' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
  ],
  prompt: [
    { key: 'text', label: 'Prompt', type: 'textarea', required: true },
    { key: 'language', label: 'Language', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
  ],
  instruction: [
    { key: 'text', label: 'Instruction', type: 'textarea', required: true },
    { key: 'language', label: 'Language', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
  ],
};

const ContentModal = ({ isOpen, onClose, type, item: editingItem, initialLanguageFrom, initialLanguageTo }) => {
  const ctx = useSnippets();
  const textSnippetsCategories = ctx.textSnippetsCategories || [];
  const fields = useMemo(() => {
    const base = FIELD_CONFIG[type] || [];
    return base.map((f) => {
      if (f.optionsKey === 'textSnippetsCategories')
        return { ...f, type: 'select', options: ['', ...textSnippetsCategories] };
      return f;
    });
  }, [type, textSnippetsCategories]);
  const add = {
    word: ctx.addWord,
    text_snippet: ctx.addTextSnippet,
    prompt: ctx.addPrompt,
    instruction: ctx.addInstruction,
  }[type];
  const update = {
    word: ctx.updateWord,
    text_snippet: ctx.updateTextSnippet,
    prompt: ctx.updatePrompt,
    instruction: ctx.updateInstruction,
  }[type];
  const remove = {
    word: ctx.deleteWord,
    text_snippet: ctx.deleteTextSnippet,
    prompt: ctx.deletePrompt,
    instruction: ctx.deleteInstruction,
  }[type];

  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const modalRef = useRef(null);
  const isEdit = !!editingItem;

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      const initial = {};
      fields.forEach(({ key }) => {
        let v = editingItem[key];
        if (key === 'tags') v = Array.isArray(v) ? v.join(', ') : (v || '');
        initial[key] = v ?? '';
      });
      setForm(initial);
    } else {
      const initial = {};
      fields.forEach(({ key }) => {
        initial[key] = key === 'tags' ? '' : '';
      });
      if (type === 'word') {
        if (initialLanguageFrom != null) initial.language_from = initialLanguageFrom;
        if (initialLanguageTo != null) initial.language_to = initialLanguageTo;
      }
      setForm(initial);
    }
    setSubmitError(null);
  }, [isOpen, editingItem, type, initialLanguageFrom, initialLanguageTo]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const getPayload = () => {
    const payload = { ...form };
    ['content', 'translation', 'notes', 'text', 'language', 'category', 'language_from', 'language_to'].forEach((k) => {
      if (payload[k] != null && typeof payload[k] === 'string') payload[k] = payload[k].trim();
    });
    if (payload.tags !== undefined) {
      payload.tags = (payload.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (type === 'word') {
      const content = (form.content ?? '').trim();
      if (!content) {
        setSubmitError('Word / phrase is required.');
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = getPayload();
      if (isEdit) {
        await update(editingItem.id, payload);
      } else {
        await add(payload);
      }
      onClose();
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const bg = '#0f1419';
  const border = '#1a1f2e';
  const text = '#e5e7eb';
  const muted = '#8b949e';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        ref={modalRef}
        className="rounded-lg border shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: bg, borderColor: border, color: text }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {isEdit ? 'Edit' : 'Add'} {type === 'text_snippet' ? 'message' : type.replace('_', ' ')}
            </h2>
            {isEdit && editingItem && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
                  setSubmitError(null);
                  try {
                    await remove(editingItem.id);
                    onClose();
                  } catch (err) {
                    setSubmitError(err?.message || 'Failed to delete');
                  }
                }}
                className="p-1.5 rounded transition-colors cursor-pointer hover:opacity-70"
                style={{ color: '#ef4444' }}
                aria-label={`Delete ${type === 'text_snippet' ? 'message' : type.replace('_', ' ')}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:opacity-80" style={{ color: muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="scrollbar-subtle p-4 overflow-y-auto space-y-3 flex-1">
            {fields.map(({ key, label, type: fieldType, required, options }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" style={{ color: muted }}>
                  {label} {required && '*'}
                </label>
                {fieldType === 'select' && Array.isArray(options) ? (
                  <select
                    value={form[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                    required={required}
                    className="w-full px-3 py-2 rounded border text-sm focus:outline-none"
                    style={{ background: bg, borderColor: border, color: text }}
                  >
                    <option value="">{key === 'category' ? '—' : 'Select…'}</option>
                    {options.filter(Boolean).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : fieldType === 'textarea' ? (
                  <textarea
                    value={form[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                    required={required}
                    rows={key === 'text' || key === 'content' ? 4 : 2}
                    className="w-full px-3 py-2 rounded border text-sm resize-y focus:outline-none"
                    style={{ background: bg, borderColor: border, color: text }}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                    required={required}
                    className="w-full px-3 py-2 rounded border text-sm focus:outline-none"
                    style={{ background: bg, borderColor: border, color: text }}
                  />
                )}
              </div>
            ))}
          </div>
          {submitError && (
            <div className="px-4 pb-2 text-sm" style={{ color: '#ef4444' }}>
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 p-4 border-t" style={{ borderColor: border }}>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-sm" style={{ color: muted }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded text-sm font-medium text-white disabled:opacity-60"
                style={{ background: '#FF8F40' }}
              >
                {submitting ? 'Saving…' : isEdit ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
