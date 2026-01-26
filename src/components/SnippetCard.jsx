import { useState, useEffect, useMemo } from 'react';
import { Info, Copy, Check, Heart, Edit } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { renderLanguageIcon } from '../utils/languageIcons';
import { useSnippets } from '../context/snippetContext';
import { ayuDarkTheme, vsCodeDarkTheme, githubLightTheme } from '../utils/colorSchemes';

const SnippetCard = ({ snippet, onEdit }) => {
  const { colorScheme, searchQuery, hasActiveSearch, toggleFavorite, isFavorite, isAuthenticated } = useSnippets();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSnippetFavorite = isFavorite(snippet.id);

  // Select theme based on color scheme
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

  const currentTheme = getTheme();
  const bgColor = getBgColor();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Enhance Python tokenization
  useEffect(() => {
    if (snippet.language === 'python' && Prism.languages.python) {
      // Add self, cls as special keywords with higher priority
      Prism.languages.python.keyword = /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield|self|cls|this)\b/;
    }
  }, [snippet.language]);

  // Highlight search matches in the code (VS Code-like find feature)
  useEffect(() => {
    if (!hasActiveSearch || !searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const codeElements = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] code`);

    codeElements.forEach(codeEl => {
      const walker = document.createTreeWalker(
        codeEl,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const nodesToHighlight = [];
      let node;

      while ((node = walker.nextNode())) {
        const text = node.textContent;
        if (text && text.toLowerCase().includes(query)) {
          nodesToHighlight.push(node);
        }
      }

      nodesToHighlight.forEach(textNode => {
        const text = textNode.textContent;
        const lowerText = text.toLowerCase();
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let searchIndex = 0;

        while ((searchIndex = lowerText.indexOf(query, lastIndex)) !== -1) {
          // Add text before match
          if (searchIndex > lastIndex) {
            fragment.appendChild(
              document.createTextNode(text.substring(lastIndex, searchIndex))
            );
          }

          // Add highlighted match
          const mark = document.createElement('mark');
          mark.textContent = text.substring(searchIndex, searchIndex + query.length);
          mark.style.backgroundColor = colorScheme === 'light' ? '#fff59d' : '#ffd60a';
          mark.style.color = colorScheme === 'light' ? '#000000' : '#000000';
          mark.style.padding = '0 2px';
          mark.style.borderRadius = '2px';
          fragment.appendChild(mark);

          lastIndex = searchIndex + query.length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex))
          );
        }

        if (fragment.childNodes.length > 0) {
          textNode.parentNode.replaceChild(fragment, textNode);
        }
      });
    });

    // Cleanup function to remove highlights when search changes
    return () => {
      const marks = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] mark`);
      marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
    };
  }, [snippet.id, searchQuery, hasActiveSearch, colorScheme]);

  const cardBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  const cardHoverBorder = colorScheme === 'light' ? '#0969da' : '#25d5f8';
  const textColor = colorScheme === 'light' ? '#57606a' : '#6b7280';
  const detailsBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';

  // Count matches in code for VS Code-like match indicator
  const matchCount = useMemo(() => {
    if (!hasActiveSearch || !searchQuery.trim()) return 0;

    const query = searchQuery.toLowerCase();
    const codeText = snippet.code.toLowerCase();
    let count = 0;
    let pos = 0;

    while ((pos = codeText.indexOf(query, pos)) !== -1) {
      count++;
      pos += query.length;
    }

    return count;
  }, [snippet.code, searchQuery, hasActiveSearch]);

  return (
    <div
      className="border rounded-lg p-3 transition-colors h-full flex flex-col"
      style={{
        background: bgColor,
        borderColor: cardBorderColor,
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = cardHoverBorder}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = cardBorderColor}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-xs font-normal leading-tight" style={{ color: textColor }}>
            {snippet.title}
          </h3>
          {/* Match count badge (VS Code-like) */}
          {matchCount > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: colorScheme === 'light' ? '#fff59d' : '#ffd60a',
                color: '#000000',
                fontSize: '0.65rem',
              }}
              title={`${matchCount} match${matchCount !== 1 ? 'es' : ''} found`}
            >
              {matchCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <div style={{ color: textColor }}>
            {renderLanguageIcon(snippet.language, { className: 'w-3.5 h-3.5' })}
          </div>
          <button
            onClick={() => toggleFavorite(snippet.id)}
            className="p-1 transition-colors cursor-pointer"
            style={{ color: isSnippetFavorite ? '#ef4444' : textColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = isSnippetFavorite ? '#ef4444' : textColor}
            aria-label={isSnippetFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={isSnippetFavorite ? '#ef4444' : 'none'}
            />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 transition-colors cursor-pointer"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = cardHoverBorder}
            onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            aria-label="Toggle details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 transition-colors cursor-pointer"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = cardHoverBorder}
            onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" style={{ color: cardHoverBorder }} />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {isAuthenticated && onEdit && (
            <button
              onClick={() => onEdit(snippet)}
              className="p-1 transition-colors cursor-pointer"
              style={{ color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = cardHoverBorder}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
              aria-label="Edit snippet"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code with Syntax Highlighting */}
      <div className="rounded overflow-hidden mb-2 flex-1" data-snippet-id={snippet.id}>
        <SyntaxHighlighter
          language={snippet.language}
          style={currentTheme}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: 0,
            background: bgColor,
            overflowX: 'auto',
          }}
          codeTagProps={{
            style: {
              fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
            }
          }}
          PreTag="div"
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>

      {/* Details - Hidden by default */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: detailsBorderColor }}>
          <div className="space-y-2 text-xs">
            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div>
                <div className="font-medium mb-1.5" style={{ color: textColor }}>Tags</div>
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded text-xs border"
                      style={{
                        backgroundColor: colorScheme === 'light' ? '#f6f8fa' : '#111827',
                        color: colorScheme === 'light' ? '#57606a' : '#9ca3af',
                        borderColor: colorScheme === 'light' ? '#d0d7de' : '#1f2937'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {snippet.category && (
              <div>
                <span className="font-medium" style={{ color: textColor }}>Category: </span>
                <span style={{ color: colorScheme === 'light' ? '#656d76' : '#6b7280' }}>{snippet.category}</span>
              </div>
            )}

            {/* Language */}
            <div>
              <span className="font-medium" style={{ color: textColor }}>Language: </span>
              <span style={{ color: colorScheme === 'light' ? '#656d76' : '#6b7280' }}>{snippet.language}</span>
            </div>

            {/* Notes */}
            {snippet.notes && (
              <div>
                <div className="font-medium mb-1" style={{ color: textColor }}>Notes</div>
                <p className="leading-relaxed" style={{ color: colorScheme === 'light' ? '#656d76' : '#6b7280' }}>
                  {snippet.notes}
                </p>
              </div>
            )}

            {/* Date */}
            <div>
              <span className="font-medium" style={{ color: textColor }}>Added: </span>
              <span style={{ color: colorScheme === 'light' ? '#656d76' : '#6b7280' }}>
                {new Date(snippet.dateAdded).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetCard;
