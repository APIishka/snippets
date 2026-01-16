import { Search } from 'lucide-react';
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
  } = useSnippets();

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="w-full px-8 py-12">
        {/* Search & Filter */}
        <div className="w-full mb-12 space-y-4">
          {/* Search Bar - Bigger */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-12 pr-4 py-4 bg-black border border-gray-800 rounded-lg text-base font-medium text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#25d5f8] transition-colors"
            />
          </div>
          
          {/* Language Filter with Icons - Only show if languages exist */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLanguage('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  selectedLanguage === 'all'
                    ? 'bg-[#25d5f8] text-black'
                    : 'bg-black border border-gray-800 text-gray-500 hover:text-[#25d5f8] hover:border-[#25d5f8]'
                }`}
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
                        : 'bg-black border border-gray-800 text-gray-500 hover:text-[#25d5f8] hover:border-[#25d5f8]'
                    }`}
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
              <p className="text-gray-600 text-sm">No snippets found</p>
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
