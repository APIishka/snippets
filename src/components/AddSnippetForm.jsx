import { useState } from 'react';
import { useSnippets } from '../context/snippetContext';

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
  'english',
  'other'
];

const AddSnippetForm = ({ onSuccess }) => {
  const { addSnippet, colorScheme } = useSnippets();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isLight = colorScheme === 'light';
  const bg = isLight ? '#ffffff' : '#1f2937';
  const border = isLight ? '#d0d7de' : '#374151';
  const text = isLight ? '#24292f' : '#e5e7eb';
  const muted = isLight ? '#57606a' : '#9ca3af';
  const accent = isLight ? '#0969da' : '#25d5f8';

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
      await addSnippet({ title: title.trim(), language, tags, code: code.trim(), notes: notes.trim() || null, category: category.trim() || null });
      setTitle('');
      setCode('');
      setTagsStr('');
      setNotes('');
      setCategory('');
      onSuccess?.();
    } catch (err) {
      setSubmitError(err?.message || 'Failed to add snippet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg border" style={{ background: bg, borderColor: border }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Debounce helper"
            className="w-full px-3 py-2 rounded border text-sm focus:outline-none"
            style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Language *</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm focus:outline-none cursor-pointer"
            style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Code *</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste or type your snippet..."
          rows={6}
          className="w-full px-3 py-2 rounded border text-sm font-mono focus:outline-none resize-y"
          style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Tags</label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="comma-separated, e.g. async, utils"
            className="w-full px-3 py-2 rounded border text-sm focus:outline-none"
            style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. patterns, algorithms"
            className="w-full px-3 py-2 rounded border text-sm focus:outline-none"
            style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: muted }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes, when to use, gotchas..."
          rows={2}
          className="w-full px-3 py-2 rounded border text-sm focus:outline-none resize-y"
          style={{ background: isLight ? '#f6f8fa' : '#111827', borderColor: border, color: text }}
        />
      </div>

      {submitError && (
        <p className="text-sm" style={{ color: '#ef4444' }}>{submitError}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-60"
          style={{ background: accent, color: '#fff' }}
        >
          {submitting ? 'Adding…' : 'Add snippet'}
        </button>
      </div>
    </form>
  );
};

export default AddSnippetForm;
