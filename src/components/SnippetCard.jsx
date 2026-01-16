import { useState } from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLanguageIcon } from '../utils/languageIcons';

const SnippetCard = ({ snippet }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Custom syntax highlighting style for black background
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#000000',
      margin: 0,
      padding: 0,
      fontSize: '0.75rem',
      lineHeight: '1.4',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.75rem',
      fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
    },
  };

  const LanguageIcon = getLanguageIcon(snippet.language);

  return (
    <div className="border border-gray-900 rounded-lg p-3 bg-black hover:border-[#25d5f8] transition-colors h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xs font-normal text-gray-600 flex-1 leading-tight">
          {snippet.title}
        </h3>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <div className="text-gray-600">
            <LanguageIcon className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-600 hover:text-[#25d5f8] transition-colors"
            aria-label="Toggle details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-gray-600 hover:text-[#25d5f8] transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#25d5f8]" />
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
          style={customStyle}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: 0,
            background: '#000000',
            overflowX: 'auto',
          }}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>

      {/* Details - Hidden by default */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-900">
          <div className="space-y-2 text-xs">
            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div>
                <div className="text-gray-600 font-medium mb-1.5">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-gray-900 text-gray-400 rounded text-xs border border-gray-800"
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
                <span className="text-gray-600 font-medium">Category: </span>
                <span className="text-gray-500">{snippet.category}</span>
              </div>
            )}
            
            {/* Language */}
            <div>
              <span className="text-gray-600 font-medium">Language: </span>
              <span className="text-gray-500">{snippet.language}</span>
            </div>
            
            {/* Notes */}
            {snippet.notes && (
              <div>
                <div className="text-gray-600 font-medium mb-1">Notes</div>
                <p className="text-gray-500 leading-relaxed">
                  {snippet.notes}
                </p>
              </div>
            )}
            
            {/* Date */}
            <div>
              <span className="text-gray-600 font-medium">Added: </span>
              <span className="text-gray-500">
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
