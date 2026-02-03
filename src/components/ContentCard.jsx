import { useState } from 'react';
import { Copy, Check, Edit, Trash2 } from 'lucide-react';

/**
 * Generic card for text-based content (words, text snippets, prompts, instructions).
 * Shows primary text, optional subtitle, notes, tags, copy button, edit/delete when authenticated.
 */
const ContentCard = ({
  item,
  primaryKey = 'text',
  subtitle,
  secondary,
  onEdit,
  onDelete,
  onCopyText,
  isAuthenticated,
  theme = 'dark',
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const primary = item[primaryKey] ?? item.content ?? item.text ?? '';
  const notes = item.notes || '';
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const dateAdded = item.dateAdded ?? item.date_added;
  const dateStr = dateAdded ? new Date(dateAdded).toLocaleDateString(undefined, { dateStyle: 'short' }) : '';
  const secondaryText = secondary != null ? (typeof secondary === 'function' ? secondary(item) : secondary) : null;

  const bg = theme === 'light' ? '#ffffff' : '#0f1419';
  const border = theme === 'light' ? '#d0d7de' : '#1a1f2e';
  const text = theme === 'light' ? '#24292f' : '#e5e7eb';
  const muted = theme === 'light' ? '#57606a' : '#8b949e';
  const accent = theme === 'light' ? '#0969da' : '#FF8F40';

  const handleCopy = async () => {
    const toCopy = typeof onCopyText === 'function' ? onCopyText(item) : primary;
    if (!toCopy) return;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete?.(item.id);
    setConfirmDelete(false);
  };

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-2 break-words"
      style={{ background: bg, borderColor: border, color: text }}
    >
      {subtitle != null && (
        <div className="text-xs font-medium" style={{ color: muted }}>
          {subtitle}
        </div>
      )}
      <div className="text-sm whitespace-pre-wrap" style={{ color: text }}>
        {primary}
      </div>
      {secondaryText && (
        <div className="text-xs mt-1 opacity-90" style={{ color: muted }}>
          {secondaryText}
        </div>
      )}
      {notes && (
        <div className="text-xs opacity-90" style={{ color: muted }}>
          {notes}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: theme === 'light' ? '#eaeef2' : '#1a1f2e', color: muted }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {dateStr && (
          <span className="text-xs" style={{ color: muted }}>
            {dateStr}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded transition-opacity hover:opacity-80"
          style={{ color: muted }}
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        {isAuthenticated && (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="p-1.5 rounded transition-opacity hover:opacity-80"
              style={{ color: muted }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`p-1.5 rounded transition-opacity hover:opacity-80 ${confirmDelete ? 'text-red-500' : ''}`}
              style={confirmDelete ? {} : { color: muted }}
              title={confirmDelete ? 'Click again to delete' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
