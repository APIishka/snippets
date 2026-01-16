import { Search, Palette } from 'lucide-react';
import { useSnippets } from '../context/SnippetContext';
import SnippetCard from '../components/SnippetCard';
import { getLanguageIcon } from '../utils/languageIcons';

const SnippetsPage = () => {
  const {
    filteredSnippets,
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    languages,
    colorScheme,
    setColorScheme,
  } = useSnippets();

  const getPageBackground = () => {
    switch (colorScheme) {
      case 'ayu': return '#0f1419';
      case 'vscode': return '#1E1E1E';
      case 'light': return '#f6f8fa';
      default: return '#0f1419';
    }
  };

  const pageBackground = getPageBackground();
  const textColor = colorScheme === 'light' ? '#24292f' : '#e5e7eb';
  const inputBorder = colorScheme === 'light' ? '#d0d7de' : '#1f2937';
  const inputText = colorScheme === 'light' ? '#24292f' : '#d1d5db';
  const inputPlaceholder = colorScheme === 'light' ? '#57606a' : '#6b7280';
  const focusBorder = colorScheme === 'light' ? '#0969da' : '#25d5f8';
  const buttonText = colorScheme === 'light' ? '#57606a' : '#6b7280';
  const buttonHoverText = colorScheme === 'light' ? '#0969da' : '#25d5f8';
  const buttonHoverBorder = colorScheme === 'light' ? '#0969da' : '#25d5f8';

  return (
    <div className="min-h-screen" style={{ background: pageBackground, color: textColor }}>
      <div className="w-full px-8 py-12">
        {/* Search & Filter */}
        <div className="w-full mb-12 space-y-4">
          {/* Search Bar & Theme Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: inputPlaceholder }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in code, titles, notes, tags..."
                className="w-full pl-12 pr-4 py-4 border rounded-lg text-base font-medium focus:outline-none transition-colors"
                style={{ 
                  background: pageBackground,
                  borderColor: inputBorder,
                  color: inputText,
                }}
                onFocus={(e) => e.target.style.borderColor = focusBorder}
                onBlur={(e) => e.target.style.borderColor = inputBorder}
              />
            </div>
            
            {/* Color Scheme Toggle */}
            <button
              onClick={() => {
                const schemes = ['ayu', 'vscode', 'light'];
                const currentIndex = schemes.indexOf(colorScheme);
                const nextIndex = (currentIndex + 1) % schemes.length;
                setColorScheme(schemes[nextIndex]);
              }}
              className="px-4 py-4 border rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              style={{ 
                background: pageBackground,
                borderColor: inputBorder,
                color: buttonText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = buttonHoverText;
                e.currentTarget.style.borderColor = buttonHoverBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = buttonText;
                e.currentTarget.style.borderColor = inputBorder;
              }}
              title="Switch color scheme"
            >
              <Palette className="w-5 h-5" />
              <span className="text-sm font-semibold">
                {colorScheme === 'ayu' ? 'Ayu Dark' : colorScheme === 'vscode' ? 'VS Code' : 'Light'}
              </span>
            </button>
          </div>
          
          {/* Language Filter with Icons - Only show if languages exist */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLanguage('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  selectedLanguage === 'all' ? '' : 'border'
                }`}
                style={
                  selectedLanguage === 'all'
                    ? { background: colorScheme === 'light' ? '#0969da' : '#25d5f8', color: '#ffffff' }
                    : { 
                        background: pageBackground,
                        borderColor: inputBorder,
                        color: buttonText,
                      }
                }
                onMouseEnter={(e) => {
                  if (selectedLanguage !== 'all') {
                    e.currentTarget.style.color = buttonHoverText;
                    e.currentTarget.style.borderColor = buttonHoverBorder;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLanguage !== 'all') {
                    e.currentTarget.style.color = buttonText;
                    e.currentTarget.style.borderColor = inputBorder;
                  }
                }}
              >
                All
              </button>
              {languages.map(lang => {
                const Icon = getLanguageIcon(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                      selectedLanguage === lang
                        ? 'bg-[#25d5f8] text-black'
                        : 'border border-gray-800 text-gray-500 hover:text-[#25d5f8] hover:border-[#25d5f8]'
                    }`}
                    style={selectedLanguage !== lang ? { background: pageBackground } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Snippets Grid - Responsive Columns */}
        <div className="w-full">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: buttonText }}>No snippets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnippets.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetsPage;
