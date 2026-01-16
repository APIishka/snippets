import { useState, useEffect, useMemo } from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { getLanguageIcon } from '../utils/languageIcons';
import { useSnippets } from '../context/SnippetContext';
import { ayuDarkTheme, vsCodeDarkTheme, githubLightTheme } from '../utils/colorSchemes';

const SnippetCard = ({ snippet }) => {
  const { colorScheme } = useSnippets();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  
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

  const cardBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  const cardHoverBorder = colorScheme === 'light' ? '#0969da' : '#25d5f8';
  const textColor = colorScheme === 'light' ? '#57606a' : '#6b7280';
  const detailsBorderColor = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  
  const LanguageIcon = useMemo(() => getLanguageIcon(snippet.language), [snippet.language]);

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
        <h3 className="text-xs font-normal flex-1 leading-tight" style={{ color: textColor }}>
          {snippet.title}
        </h3>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <div style={{ color: textColor }}>
            <LanguageIcon className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = cardHoverBorder}
            onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            aria-label="Toggle details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 transition-colors"
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
        </div>
      </div>

      {/* Code with Syntax Highlighting */}
      <div className="rounded overflow-hidden mb-2 flex-1">
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
