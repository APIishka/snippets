import { useState } from 'react';
import { Search, Palette, Heart, Lock, Unlock, Plus } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import SnippetCard from '../components/SnippetCard';
import AddSnippetModal from '../components/AddSnippetModal';
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
    showFavoritesOnly,
    setShowFavoritesOnly,
    favoritesCount,
    loading,
    fetchError,
    fetchSnippets,
    isAuthenticated,
    isAuthLoading,
    loginError,
    loginWithPassword,
    logout,
  } = useSnippets();

  const [password, setPassword] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUnlock = async () => {
    if (!password.trim()) return;
    setUnlockLoading(true);
    const ok = await loginWithPassword(password);
    setUnlockLoading(false);
    if (ok) setPassword('');
  };

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
              className="px-4 py-4 border rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
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
                onClick={() => {
                  setSelectedLanguage('all');
                  setShowFavoritesOnly(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  selectedLanguage === 'all' && !showFavoritesOnly ? '' : 'border'
                }`}
                style={
                  selectedLanguage === 'all' && !showFavoritesOnly
                    ? { background: colorScheme === 'light' ? '#0969da' : '#25d5f8', color: '#ffffff' }
                    : {
                        background: pageBackground,
                        borderColor: inputBorder,
                        color: buttonText,
                      }
                }
                onMouseEnter={(e) => {
                  if (selectedLanguage !== 'all' || showFavoritesOnly) {
                    e.currentTarget.style.color = buttonHoverText;
                    e.currentTarget.style.borderColor = buttonHoverBorder;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLanguage !== 'all' || showFavoritesOnly) {
                    e.currentTarget.style.color = buttonText;
                    e.currentTarget.style.borderColor = inputBorder;
                  }
                }}
              >
                All
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                  showFavoritesOnly ? '' : 'border'
                }`}
                style={
                  showFavoritesOnly
                    ? { background: '#ef4444', color: '#ffffff' }
                    : {
                        background: pageBackground,
                        borderColor: inputBorder,
                        color: buttonText,
                      }
                }
                onMouseEnter={(e) => {
                  if (!showFavoritesOnly) {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showFavoritesOnly) {
                    e.currentTarget.style.color = buttonText;
                    e.currentTarget.style.borderColor = inputBorder;
                  }
                }}
              >
                <Heart
                  className="w-4 h-4"
                  fill={showFavoritesOnly ? '#ffffff' : 'none'}
                />
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </button>
              {languages.map(lang => {
                const Icon = getLanguageIcon(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowFavoritesOnly(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                      selectedLanguage === lang && !showFavoritesOnly ? '' : 'border'
                    }`}
                    style={
                      selectedLanguage === lang && !showFavoritesOnly
                        ? { background: colorScheme === 'light' ? '#0969da' : '#25d5f8', color: '#ffffff' }
                        : {
                            background: pageBackground,
                            borderColor: inputBorder,
                            color: buttonText,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (selectedLanguage !== lang || showFavoritesOnly) {
                        e.currentTarget.style.color = buttonHoverText;
                        e.currentTarget.style.borderColor = buttonHoverBorder;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLanguage !== lang || showFavoritesOnly) {
                        e.currentTarget.style.color = buttonText;
                        e.currentTarget.style.borderColor = inputBorder;
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Password gate & Add button */}
        {!isAuthLoading && (
          <div className="w-full mb-8">
            {!isAuthenticated ? (
              <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border" style={{ background: pageBackground, borderColor: inputBorder }}>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-1" style={{ color: buttonText }}>Password to add or edit snippets</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUnlock())}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 rounded border text-sm focus:outline-none cursor-pointer"
                    style={{ background: pageBackground, borderColor: inputBorder, color: inputText }}
                  />
                </div>
                <button
                  onClick={handleUnlock}
                  disabled={unlockLoading}
                  className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  style={{ background: focusBorder, color: '#fff' }}
                >
                  <Unlock className="w-4 h-4" />
                  {unlockLoading ? 'Checking…' : 'Unlock editing'}
                </button>
                {loginError && <p className="text-sm w-full" style={{ color: '#ef4444' }}>{loginError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ 
                    background: focusBorder, 
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Plus className="w-4 h-4" />
                  Add New Snippet
                </button>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ 
                    background: pageBackground, 
                    borderColor: inputBorder, 
                    color: buttonText, 
                    border: '1px solid' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = buttonHoverText;
                    e.currentTarget.style.borderColor = buttonHoverBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = buttonText;
                    e.currentTarget.style.borderColor = inputBorder;
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Lock
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Snippet Modal */}
        {isAuthenticated && (
          <AddSnippetModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setIsModalOpen(false)}
          />
        )}

        {/* Snippets Grid - Responsive Columns */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: buttonText }}>Loading snippets…</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-sm" style={{ color: '#ef4444' }}>{fetchError}</p>
              <button
                onClick={() => fetchSnippets()}
                className="px-4 py-2 rounded text-sm cursor-pointer"
                style={{ background: focusBorder, color: '#fff' }}
              >
                Retry
              </button>
            </div>
          ) : filteredSnippets.length === 0 ? (
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
