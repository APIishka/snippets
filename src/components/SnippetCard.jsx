import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [showInfoAbove, setShowInfoAbove] = useState(false);
  const [showInfoOnLeft, setShowInfoOnLeft] = useState(false);
  const infoCardRef = useRef(null);
  const cardRef = useRef(null);

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

  // Check if info card should be shown above on mobile or left on desktop
  useEffect(() => {
    if (!showDetails || !cardRef.current || !infoCardRef.current) return;

    const checkPosition = () => {
      const cardRect = cardRef.current.getBoundingClientRect();

      if (window.innerWidth >= 768) {
        // Desktop: check if card is in rightmost column
        const viewportWidth = window.innerWidth;
        const cardRight = cardRect.right;
        const spaceOnRight = viewportWidth - cardRight;
        const infoCardWidth = 320; // w-80 = 320px

        // If not enough space on right, show on left
        setShowInfoOnLeft(spaceOnRight < infoCardWidth);
        setShowInfoAbove(false);
        return;
      }

      // Mobile: check if there's enough space below
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - cardRect.bottom;
      const estimatedInfoHeight = 200; // Approximate height of info card

      // If not enough space below, show above
      setShowInfoAbove(spaceBelow < estimatedInfoHeight);
      setShowInfoOnLeft(false);
    };

    // Check immediately and after a short delay to account for rendering
    checkPosition();
    const timeoutId = setTimeout(checkPosition, 100);

    // Also check on resize
    window.addEventListener('resize', checkPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkPosition);
    };
  }, [showDetails]);

  // Click outside handler
  useEffect(() => {
    if (!showDetails) return;

    const handleClickOutside = (event) => {
      if (
        infoCardRef.current &&
        !infoCardRef.current.contains(event.target) &&
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setShowDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetails]);

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
      Prism.languages.python.keyword = /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield|self|cls|this)\b/;
    }
  }, [snippet.language]);

  // Highlight search matches in the code
  useEffect(() => {
    let timeoutId = null;

    if (!hasActiveSearch || !searchQuery.trim()) {
      // Clean up any existing marks when search is cleared
      const marks = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] mark`);
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    // Wait for syntax highlighter to finish rendering
    timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const codeElements = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] code`);

      // First, clean up any existing marks
      const existingMarks = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] mark`);
      existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });

      codeElements.forEach(codeEl => {
        // Only process if codeEl exists and hasn't been processed
        if (!codeEl || codeEl.querySelector('mark')) return;

        const walker = document.createTreeWalker(
          codeEl,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              // Skip if node is inside a mark element
              let parent = node.parentNode;
              while (parent && parent !== codeEl) {
                if (parent.tagName === 'MARK') {
                  return NodeFilter.FILTER_REJECT;
                }
                parent = parent.parentNode;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          },
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

          if (!lowerText.includes(query)) return;

          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let searchIndex = 0;

          while ((searchIndex = lowerText.indexOf(query, lastIndex)) !== -1) {
            if (searchIndex > lastIndex) {
              fragment.appendChild(
                document.createTextNode(text.substring(lastIndex, searchIndex))
              );
            }

            const mark = document.createElement('mark');
            mark.textContent = text.substring(searchIndex, searchIndex + query.length);
            mark.style.backgroundColor = colorScheme === 'light' ? '#fff59d' : '#ffd60a';
            mark.style.color = '#000000';
            mark.style.padding = '0 2px';
            mark.style.borderRadius = '2px';
            fragment.appendChild(mark);

            lastIndex = searchIndex + query.length;
          }

          if (lastIndex < text.length) {
            fragment.appendChild(
              document.createTextNode(text.substring(lastIndex))
            );
          }

          if (fragment.childNodes.length > 0 && textNode.parentNode) {
            textNode.parentNode.replaceChild(fragment, textNode);
          }
        });
      });
    }, 50); // Small delay to ensure syntax highlighter has rendered

    return () => {
      clearTimeout(timeoutId);
      const marks = document.querySelectorAll(`[data-snippet-id="${snippet.id}"] mark`);
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });
    };
  }, [snippet.id, searchQuery, hasActiveSearch, colorScheme]);

  const cardBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  const cardHoverBorder = colorScheme === 'light' ? '#0969da' : '#25d5f8';
  const textColor = colorScheme === 'light' ? '#57606a' : '#6b7280';

  // Color scheme specific colors
  const getTagBorderColor = () => {
    switch (colorScheme) {
      case 'ayu': return '#59C2FF'; // Blue
      case 'vscode': return '#25d5f8'; // Cyan
      case 'light': return '#0969da'; // Blue
      default: return '#59C2FF';
    }
  };

  const getCategoryBorderColor = () => {
    switch (colorScheme) {
      case 'ayu': return '#FF8F40'; // Orange
      case 'vscode': return '#C586C0'; // Purple
      case 'light': return '#8250df'; // Purple
      default: return '#FF8F40';
    }
  };

  const getLanguageColor = () => {
    switch (colorScheme) {
      case 'ayu': return '#A8D84D'; // Green
      case 'vscode': return '#4EC9B0'; // Teal
      case 'light': return '#116329'; // Green
      default: return '#A8D84D';
    }
  };

  const tagBorderColor = getTagBorderColor();
  const categoryBorderColor = getCategoryBorderColor();
  const languageColor = getLanguageColor();

  // Count matches in code
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to highlight search matches in text
  const highlightSearchMatches = (text) => {
    if (!hasActiveSearch || !searchQuery.trim() || !text) {
      return text;
    }

    const query = searchQuery.toLowerCase();
    const lowerText = text.toLowerCase();

    if (!lowerText.includes(query)) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while ((searchIndex = lowerText.indexOf(query, lastIndex)) !== -1) {
      // Add text before match
      if (searchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, searchIndex));
      }

      // Add highlighted match
      const match = text.substring(searchIndex, searchIndex + query.length);
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

      lastIndex = searchIndex + query.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="relative md:group">
      {/* Main Snippet Card */}
      <div
        ref={cardRef}
        className="border rounded-lg p-3 transition-colors flex flex-col snippet-card-container"
        data-snippet-card-id={snippet.id}
        style={{
          background: bgColor,
          borderColor: cardBorderColor,
          maxHeight: '100vh', // 1.5 times viewport height
          overflow: 'hidden', // Prevent card from scrolling, code section will scroll
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
        <div
          className="rounded overflow-x-auto overflow-y-auto flex-1"
          data-snippet-id={snippet.id}
          style={{
            minWidth: 0, // Allows flex item to shrink below content size
            minHeight: 0, // Allows flex item to shrink and enable scrolling
            maxHeight: 'calc(100vh - 100px)', // Account for header and padding
          }}
        >
          <style>{`
            /* Card container scrollbar - almost invisible */
            [data-snippet-card-id="${snippet.id}"] {
              scrollbar-width: thin;
              scrollbar-color: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3) transparent' : 'rgba(74, 74, 74, 0.3) transparent'};
            }
            [data-snippet-card-id="${snippet.id}"]::-webkit-scrollbar {
              width: 6px;
            }
            [data-snippet-card-id="${snippet.id}"]::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 3px;
            }
            [data-snippet-card-id="${snippet.id}"]::-webkit-scrollbar-thumb {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3)' : 'rgba(74, 74, 74, 0.3)'};
              border-radius: 3px;
            }
            [data-snippet-card-id="${snippet.id}"]::-webkit-scrollbar-thumb:hover {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.5)' : 'rgba(74, 74, 74, 0.5)'};
            }
            /* Code container scrollbar - almost invisible */
            [data-snippet-id="${snippet.id}"] {
              scrollbar-width: thin;
              scrollbar-color: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3) transparent' : 'rgba(74, 74, 74, 0.3) transparent'};
            }
            /* Chrome, Safari, Opera scrollbar - almost invisible */
            [data-snippet-id="${snippet.id}"]::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            [data-snippet-id="${snippet.id}"]::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 3px;
            }
            [data-snippet-id="${snippet.id}"]::-webkit-scrollbar-thumb {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3)' : 'rgba(74, 74, 74, 0.3)'};
              border-radius: 3px;
            }
            [data-snippet-id="${snippet.id}"]::-webkit-scrollbar-thumb:hover {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.5)' : 'rgba(74, 74, 74, 0.5)'};
            }
            /* SyntaxHighlighter pre element scrollbar - almost invisible */
            [data-snippet-id="${snippet.id}"] pre {
              scrollbar-width: thin;
              scrollbar-color: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3) transparent' : 'rgba(74, 74, 74, 0.3) transparent'};
            }
            [data-snippet-id="${snippet.id}"] pre::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            [data-snippet-id="${snippet.id}"] pre::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 3px;
            }
            [data-snippet-id="${snippet.id}"] pre::-webkit-scrollbar-thumb {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.3)' : 'rgba(74, 74, 74, 0.3)'};
              border-radius: 3px;
            }
            [data-snippet-id="${snippet.id}"] pre::-webkit-scrollbar-thumb:hover {
              background: ${colorScheme === 'light' ? 'rgba(225, 228, 232, 0.5)' : 'rgba(74, 74, 74, 0.5)'};
            }
          `}</style>
          <SyntaxHighlighter
            language={snippet.language}
            style={currentTheme}
            showLineNumbers={false}
            wrapLines={false}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: 0,
              background: bgColor,
              overflowX: 'auto',
              overflowY: 'auto',
              whiteSpace: 'pre',
              wordWrap: 'normal',
              wordBreak: 'normal',
              maxHeight: '100%',
            }}
            codeTagProps={{
              style: {
                fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
                whiteSpace: 'pre',
                wordWrap: 'normal',
                wordBreak: 'normal',
              }
            }}
            PreTag="div"
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Info Card - Positioned next to snippet */}
      {showDetails && (
        <div
          ref={infoCardRef}
          className={`absolute z-50 border rounded-lg p-3 md:p-4 shadow-xl
                     left-0 right-0
                     ${showInfoAbove ? 'bottom-full mb-2' : 'top-full mt-2'}
                     ${showInfoOnLeft
              ? 'md:top-0 md:right-full md:left-auto md:bottom-auto md:mb-0 md:mr-2 md:w-80'
              : 'md:top-0 md:left-full md:right-auto md:bottom-auto md:mb-0 md:ml-2 md:w-80'}`}
          style={{
            background: bgColor,
            borderColor: cardBorderColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 text-xs">
            {/* Notes - First, white text on dark, dark text on light */}
            {snippet.notes && (
              <div
                className="text-sm leading-relaxed"
                style={{
                  color: colorScheme === 'light' ? '#24292f' : '#ffffff'
                }}
              >
                {highlightSearchMatches(snippet.notes)}
              </div>
            )}

            {/* First Row: Tags and Added Date */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              {/* Tags */}
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded text-xs border"
                      style={{
                        backgroundColor: 'transparent',
                        color: tagBorderColor,
                        borderColor: tagBorderColor,
                      }}
                    >
                      {highlightSearchMatches(tag)}
                    </span>
                  ))}
                </div>
              )}

              {/* Added Date - Right side */}
              {snippet.dateAdded && (
                <div className="text-xs flex-shrink-0" style={{ color: textColor }}>
                  {formatDate(snippet.dateAdded)}
                </div>
              )}
            </div>

            {/* Second Row: Category and Language */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category - Different color from tags */}
              {snippet.category && (
                <span
                  className="px-2 py-1 rounded text-xs border"
                  style={{
                    backgroundColor: 'transparent',
                    color: categoryBorderColor,
                    borderColor: categoryBorderColor,
                  }}
                >
                  {highlightSearchMatches(snippet.category)}
                </span>
              )}

              {/* Language - Green on ayu */}
              <span
                className="px-2 py-1 rounded text-xs border"
                style={{
                  backgroundColor: 'transparent',
                  color: languageColor,
                  borderColor: languageColor,
                }}
              >
                {highlightSearchMatches(snippet.language)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetCard;
