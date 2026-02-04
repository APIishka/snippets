import { useState, useEffect, useRef } from 'react';
import { Info, Heart, Edit, Copy, Check } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';

/**
 * Card for content types (words, text_snippets, prompts, instructions).
 * compact: single line, smaller (for words). No copy button, no border hover.
 */
// Highlight search query in text (same style as SnippetCard)
function highlightSearchMatches(text, query, colorScheme) {
  if (!query || !(query = query.trim()) || !text) return text;
  const q = query.toLowerCase();
  const lowerText = String(text).toLowerCase();
  if (!lowerText.includes(q)) return text;
  const parts = [];
  let lastIndex = 0;
  let searchIndex = 0;
  const str = String(text);
  while ((searchIndex = lowerText.indexOf(q, lastIndex)) !== -1) {
    if (searchIndex > lastIndex) parts.push(str.substring(lastIndex, searchIndex));
    const match = str.substring(searchIndex, searchIndex + q.length);
    parts.push(
      <mark
        key={searchIndex}
        style={{
          backgroundColor: colorScheme === 'light' ? '#fff59d' : '#ffd60a',
          color: '#000000',
          padding: '0 2px',
          borderRadius: '2px',
        }}
      >
        {match}
      </mark>
    );
    lastIndex = searchIndex + q.length;
  }
  if (lastIndex < str.length) parts.push(str.substring(lastIndex));
  return parts.length > 0 ? parts : text;
}

const UnifiedContentCard = ({
  item,
  contentType,
  title,
  languageLabel,
  bodyText,
  onEdit,
  onDelete,
  isAuthenticated,
  compact = false,
}) => {
  const { colorScheme, toggleContentFavorite, isContentFavorite, contentSearchQuery } = useSnippets();
  const hasContentSearch = contentSearchQuery && contentSearchQuery.trim().length > 0;
  const highlight = (t) => (hasContentSearch ? highlightSearchMatches(t, contentSearchQuery, colorScheme) : t);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const toCopy = bodyText ?? item.text ?? item.content ?? '';
    if (!toCopy) return;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  const [showInfoAbove, setShowInfoAbove] = useState(false);
  const [showInfoOnLeft, setShowInfoOnLeft] = useState(false);
  const infoCardRef = useRef(null);
  const cardRef = useRef(null);

  const bgColor = colorScheme === 'light' ? '#ffffff' : (colorScheme === 'ayu' ? '#0f1419' : '#1E1E1E');
  const cardBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  const textColor = colorScheme === 'light' ? '#57606a' : '#6b7280';
  const tagBorderColor = colorScheme === 'ayu' ? '#59C2FF' : (colorScheme === 'vscode' ? '#25d5f8' : '#0969da');
  const languageBadgeBorder = cardBorderColor;
  const languageBadgeColor = textColor;

  const isFav = isContentFavorite(contentType, item.id);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dateAdded = item.dateAdded ?? item.date_added;
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const notes = item.notes || '';

  useEffect(() => {
    if (!showDetails || !cardRef.current || !infoCardRef.current) return;
    const checkPosition = () => {
      const cardRect = cardRef.current.getBoundingClientRect();
      if (window.innerWidth >= 768) {
        const spaceOnRight = window.innerWidth - cardRect.right;
        setShowInfoOnLeft(spaceOnRight < 320);
        setShowInfoAbove(false);
      } else {
        const spaceBelow = window.innerHeight - cardRect.bottom;
        setShowInfoAbove(spaceBelow < 200);
        setShowInfoOnLeft(false);
      }
    };
    checkPosition();
    const t = setTimeout(checkPosition, 100);
    window.addEventListener('resize', checkPosition);
    return () => { clearTimeout(t); window.removeEventListener('resize', checkPosition); };
  }, [showDetails]);

  useEffect(() => {
    if (!showDetails) return;
    const handleClickOutside = (e) => {
      if (infoCardRef.current && !infoCardRef.current.contains(e.target) && cardRef.current && !cardRef.current.contains(e.target)) {
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetails]);

  const bodyColor = colorScheme === 'light' ? '#24292f' : '#e5e7eb';

  if (compact) {
    return (
      <div className="relative md:group">
        <div
          ref={cardRef}
          className="border rounded px-2 py-1 flex items-start gap-1.5 min-h-0"
          style={{
            background: bgColor,
            borderColor: cardBorderColor,
          }}
        >
          <div className="flex-1 min-w-0 text-sm break-words" style={{ color: bodyColor }} title={bodyText}>
            {highlight(bodyText)}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {languageLabel && contentType !== 'text_snippet' && (
              <span className="text-[10px] px-1 py-0.5 rounded border font-medium" style={{ color: languageBadgeColor, borderColor: languageBadgeBorder }}>
                {languageLabel}
              </span>
            )}
            <button type="button" onClick={() => toggleContentFavorite(contentType, item.id)} className="p-1 cursor-pointer" style={{ color: isFav ? '#ef4444' : textColor }} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
              <Heart className="w-3 h-3" fill={isFav ? '#ef4444' : 'none'} />
            </button>
            <button type="button" onClick={() => setShowDetails(!showDetails)} className="p-1 cursor-pointer" style={{ color: textColor }} aria-label="Toggle details">
              <Info className="w-3 h-3" />
            </button>
            <button type="button" onClick={handleCopy} className="p-1 cursor-pointer" style={{ color: copied ? '#22c55e' : textColor }} aria-label="Copy" title="Copy">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            {isAuthenticated && onEdit && (
              <button type="button" onClick={() => onEdit(item)} className="p-1 cursor-pointer" style={{ color: textColor }} aria-label="Edit">
                <Edit className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        {showDetails && (
          <div
            ref={infoCardRef}
            className={`absolute z-50 border rounded-lg p-3 shadow-xl left-0 right-0 text-xs
              ${showInfoAbove ? 'bottom-full mb-1' : 'top-full mt-1'}
              ${showInfoOnLeft ? 'md:top-0 md:right-full md:left-auto md:bottom-auto md:mb-0 md:mr-1 md:w-64' : 'md:top-0 md:left-full md:right-auto md:bottom-auto md:mb-0 md:ml-1 md:w-64'}`}
            style={{ background: bgColor, borderColor: cardBorderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {contentType === 'word' && (item.language_from || item.language_to) && (
              <div className="mb-2" style={{ color: textColor }}>
                {[item.language_from, item.language_to].filter(Boolean).join(' → ')}
              </div>
            )}
            {(contentType === 'text_snippet' && (item.category || item.language)) || (contentType === 'talk' && item.language) ? (
              <div className="mb-2" style={{ color: textColor }}>
                {contentType === 'talk' ? item.language : [item.category, item.language].filter(Boolean).join(' · ')}
              </div>
            ) : null}
            {notes && <div className="mb-2" style={{ color: bodyColor }}>{highlight(notes)}</div>}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <span key={index} className="px-1.5 py-0.5 rounded border" style={{ color: tagBorderColor, borderColor: tagBorderColor }}>{highlight(tag)}</span>
              ))}
              {dateAdded && <span style={{ color: textColor }}>{formatDate(dateAdded)}</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isMessageCard = contentType === 'text_snippet' || contentType === 'talk';
  const copyOnCardClick = contentType === 'text_snippet' || contentType === 'talk' || contentType === 'prompt';
  const handleCardClick = copyOnCardClick ? () => handleCopy() : undefined;
  const useTightSpacing = isMessageCard || contentType === 'prompt' || contentType === 'instruction';
  const cardPadding = useTightSpacing ? 'p-2' : 'p-3';
  const cardGap = useTightSpacing ? 'gap-1.5' : 'gap-2';

  return (
    <div className="relative md:group">
      <div
        ref={cardRef}
        className={`border rounded-lg ${cardPadding} flex flex-col min-h-0 ${copyOnCardClick ? 'cursor-pointer' : ''}`}
        style={{
          background: bgColor,
          borderColor: cardBorderColor,
        }}
        onClick={handleCardClick}
        onKeyDown={copyOnCardClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy(); } } : undefined}
        role={copyOnCardClick ? 'button' : undefined}
        tabIndex={copyOnCardClick ? 0 : undefined}
        title={copyOnCardClick ? 'Click to copy' : undefined}
      >
        <div className={`flex items-start justify-between ${cardGap} ${isMessageCard ? '' : 'mb-2'}`}>
          {!isMessageCard && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-xs font-normal leading-tight break-words" style={{ color: textColor }} title={title ?? (item.content ?? item.text)}>
                {highlight(title != null ? title : (item.content ?? item.text ?? ''))}
              </h3>
            </div>
          )}
          {isMessageCard && (
            <div className="flex-1 min-w-0 rounded overflow-x-auto text-sm whitespace-pre-wrap break-words" style={{ color: bodyColor }}>
              {highlight(bodyText)}
            </div>
          )}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {languageLabel && !isMessageCard && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ color: languageBadgeColor, borderColor: languageBadgeBorder }}>
                {languageLabel}
              </span>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleContentFavorite(contentType, item.id); }} className="p-1 cursor-pointer" style={{ color: isFav ? '#ef4444' : textColor }} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
              <Heart className="w-3.5 h-3.5" fill={isFav ? '#ef4444' : 'none'} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }} className="p-1 cursor-pointer" style={{ color: textColor }} aria-label="Toggle details">
              <Info className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-1 cursor-pointer" style={{ color: copied ? '#22c55e' : textColor }} aria-label="Copy" title="Copy">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isAuthenticated && onEdit && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 cursor-pointer" style={{ color: textColor }} aria-label="Edit">
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {!isMessageCard && (
          <div
            className="rounded overflow-x-auto text-sm whitespace-pre-wrap break-words"
            style={{ minWidth: 0, color: bodyColor }}
          >
            {highlight(bodyText)}
          </div>
        )}
      </div>

      {showDetails && (
        <div
          ref={infoCardRef}
          className={`absolute z-50 border rounded-lg p-3 md:p-4 shadow-xl left-0 right-0
            ${showInfoAbove ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${showInfoOnLeft ? 'md:top-0 md:right-full md:left-auto md:bottom-auto md:mb-0 md:mr-2 md:w-80' : 'md:top-0 md:left-full md:right-auto md:bottom-auto md:mb-0 md:ml-2 md:w-80'}`}
          style={{ background: bgColor, borderColor: cardBorderColor }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 text-xs">
            {contentType === 'word' && (item.language_from || item.language_to) && (
              <div style={{ color: textColor }}>
                {[item.language_from, item.language_to].filter(Boolean).join(' → ')}
              </div>
            )}
            {(contentType === 'text_snippet' && (item.category || item.language)) || (contentType === 'talk' && item.language) ? (
              <div style={{ color: textColor }}>
                {contentType === 'talk' ? item.language : [item.category, item.language].filter(Boolean).join(' · ')}
              </div>
            ) : null}
            {notes && (
              <div className="text-sm leading-relaxed" style={{ color: colorScheme === 'light' ? '#24292f' : '#ffffff' }}>
                {highlight(notes)}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 rounded text-xs border" style={{ backgroundColor: 'transparent', color: tagBorderColor, borderColor: tagBorderColor }}>
                      {highlight(tag)}
                    </span>
                  ))}
                </div>
              )}
              {dateAdded && <div className="text-xs flex-shrink-0" style={{ color: textColor }}>{formatDate(dateAdded)}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedContentCard;
