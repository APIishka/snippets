import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Palette, Heart, Lock, Unlock, Plus, ChevronDown } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import SnippetCard from '../components/SnippetCard';
import AddSnippetModal from '../components/AddSnippetModal';
import { getLanguageIcon, renderLanguageIcon } from '../utils/languageIcons';

/**
 * Masonry layout component that distributes snippets across columns
 * with newest items appearing at the top, minimizing gaps between items.
 */
const MasonryLayout = ({ snippets, onEdit }) => {
  const [columnCount, setColumnCount] = useState(1);
  const [positions, setPositions] = useState({});
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const resizeTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  // Update column count based on screen width
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setColumnCount(3);
      } else if (width >= 768) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateColumnCount();

    // Debounce resize handler for better performance
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateColumnCount, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Memoized height estimation based on code length only
  const estimateHeight = useCallback((snippet) => {
    const codeLines = (snippet.code || '').split('\n').length;
    const baseHeight = 120; // Card structure, padding, header
    const codeHeight = Math.max(100, codeLines * 20); // ~20px per line, min 100px
    return baseHeight + codeHeight;
  }, []);

  // Distribute items to columns balancing heights, newest first
  const distributedItems = useMemo(() => {
    if (columnCount === 1) {
      return snippets.map((snippet) => ({ snippet, column: 0 }));
    }

    const columns = Array.from({ length: columnCount }, () => []);
    const columnHeights = Array(columnCount).fill(0);

    // Distribute each snippet to the shortest column
    snippets.forEach((snippet) => {
      const estimatedHeight = estimateHeight(snippet);
      let minIndex = 0;
      for (let i = 1; i < columnCount; i++) {
        if (columnHeights[i] < columnHeights[minIndex]) {
          minIndex = i;
        }
      }
      columns[minIndex].push(snippet);
      columnHeights[minIndex] += estimatedHeight;
    });

    // Flatten columns into row-by-row order for rendering
    const result = [];
    const maxLength = Math.max(...columns.map(col => col.length));
    for (let row = 0; row < maxLength; row++) {
      for (let col = 0; col < columnCount; col++) {
        if (columns[col][row]) {
          result.push({ snippet: columns[col][row], column: col });
        }
      }
    }
    return result;
  }, [snippets, columnCount, estimateHeight]);

  // Measure actual heights and calculate absolute positions
  useEffect(() => {
    if (columnCount === 1 || distributedItems.length === 0) {
      // Defer state updates to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setPositions({});
        setContainerHeight(0);
      });
      return;
    }

    const updatePositions = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const newPositions = {};
        const columnHeights = Array(columnCount).fill(0);
        const gap = 16; // 1rem = 16px
        const containerWidth = containerRef.current?.offsetWidth || 0;

        if (containerWidth <= 0) return;

        const columnWidth = (containerWidth - (columnCount - 1) * gap) / columnCount;

        distributedItems.forEach(({ snippet, column }) => {
          const element = itemRefs.current[snippet.id];
          if (element && columnWidth > 0) {
            const height = element.offsetHeight || element.scrollHeight || 200;
            newPositions[snippet.id] = {
              position: 'absolute',
              left: `${column * (columnWidth + gap)}px`,
              top: `${columnHeights[column]}px`,
              width: `${columnWidth}px`,
            };
            columnHeights[column] += height + gap;
          }
        });

        setPositions(newPositions);
        setContainerHeight(Math.max(...columnHeights, 0));
      });
    };

    // Initial measurement after render
    const timeoutId = setTimeout(updatePositions, 50);

    // Handle resize with debouncing
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updatePositions, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [distributedItems, columnCount]);

  if (columnCount === 1) {
    return (
      <div className="space-y-4">
        {snippets.map(snippet => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onEdit={onEdit}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .masonry-container {
          position: relative;
          width: 100%;
        }
        .masonry-item {
          transition: top 0.2s ease, left 0.2s ease;
        }
      `}</style>
      <div
        ref={containerRef}
        className="masonry-container"
        style={{ height: containerHeight || 'auto', minHeight: containerHeight || 100 }}
      >
        {distributedItems.map(({ snippet }) => (
          <div
            key={snippet.id}
            ref={el => { if (el) itemRefs.current[snippet.id] = el; }}
            className="masonry-item"
            style={positions[snippet.id] || { position: 'relative', width: '100%' }}
          >
            <SnippetCard
              snippet={snippet}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    </>
  );
};


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
    deleteSnippet,
  } = useSnippets();

  const [password, setPassword] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const handleOpenModal = () => {
    setEditingSnippet(null);
    setIsModalOpen(true);
  };

  const handleEditSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSnippet(null);
  };

  const handleDeleteSnippet = async (id) => {
    // Confirmation is handled in AddSnippetModal, so we just delete here
    try {
      await deleteSnippet(id);
    } catch (err) {
      alert('Failed to delete snippet: ' + (err?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

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
  const inputBorder = colorScheme === 'light' ? '#d0d7de' : (colorScheme === 'ayu' ? '#1a1f2e' : '#1f2937');
  const inputText = colorScheme === 'light' ? '#24292f' : (colorScheme === 'ayu' ? '#d0d0d0' : '#d1d5db');
  const inputPlaceholder = colorScheme === 'light' ? '#57606a' : (colorScheme === 'ayu' ? '#828C99' : '#6b7280');
  const focusBorder = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const buttonText = colorScheme === 'light' ? '#57606a' : (colorScheme === 'ayu' ? '#8b949e' : '#6b7280');
  const buttonHoverText = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const buttonHoverBorder = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');

  // Input background colors - theme-specific
  const getInputBackground = () => {
    if (colorScheme === 'light') return '#f6f8fa';
    if (colorScheme === 'ayu') return '#0f1419'; // Match page background
    return '#252526'; // VS Code
  };
  const inputBackground = getInputBackground();
  const modalBg = colorScheme === 'light' ? '#ffffff' : (colorScheme === 'ayu' ? '#0f1419' : '#1E1E1E');

  const placeholderColor = colorScheme === 'light' ? 'rgba(36, 41, 47, 0.25)' : 'rgba(229, 231, 235, 0.25)';

  return (
    <div className="min-h-screen" style={{ background: pageBackground, color: textColor }}>
      <style>{`
        .search-input::placeholder {
          color: ${placeholderColor} !important;
          opacity: 1;
          font-size: 0.875rem;
        }
      `}</style>
      <div className="w-full px-4 md:px-8 py-6 md:py-12">
        {/* Search & Filter */}
        <div className="w-full mb-8 md:mb-12 space-y-3 md:space-y-4">
          {/* Search Bar & Theme Toggle */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5" style={{ color: inputPlaceholder }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in code, titles, notes, tags..."
                className="search-input w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-4 border rounded-lg text-sm md:text-base font-medium focus:outline-none transition-colors"
                style={{
                  background: inputBackground,
                  borderColor: inputBorder,
                  color: inputText,
                }}
                onFocus={(e) => e.target.style.borderColor = focusBorder}
                onBlur={(e) => e.target.style.borderColor = inputBorder}
              />
            </div>

            {/* Color Scheme Toggle - Desktop only */}
            <button
              onClick={() => {
                const schemes = ['ayu', 'vscode', 'light'];
                const currentIndex = schemes.indexOf(colorScheme);
                const nextIndex = (currentIndex + 1) % schemes.length;
                setColorScheme(schemes[nextIndex]);
              }}
              className="hidden md:flex px-4 py-4 border rounded-lg transition-colors items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
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

          {/* Language Filter - Dropdown on mobile, buttons on desktop */}
          {languages.length > 0 && (
            <>
              {/* Mobile: Dropdown */}
              <div className="md:hidden relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer"
                  style={{
                    background: inputBackground,
                    borderColor: inputBorder,
                    color: inputText,
                  }}
                >
                  <span className="flex items-center gap-2">
                    {showFavoritesOnly ? (
                      <>
                        <Heart className="w-4 h-4" fill="#ef4444" />
                        <span>Favorites {favoritesCount > 0 && `(${favoritesCount})`}</span>
                      </>
                    ) : selectedLanguage === 'all' ? (
                      'All Languages'
                    ) : (
                      <>
                        {renderLanguageIcon(selectedLanguage, { className: 'w-4 h-4' })}
                        <span>{selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}</span>
                      </>
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto" style={{ background: modalBg, borderColor: inputBorder }}>
                    <button
                      onClick={() => {
                        setSelectedLanguage('all');
                        setShowFavoritesOnly(false);
                        setIsFilterDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ color: selectedLanguage === 'all' && !showFavoritesOnly ? focusBorder : inputText }}
                    >
                      All Languages
                    </button>
                    <button
                      onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        setIsFilterDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ color: showFavoritesOnly ? '#ef4444' : inputText }}
                    >
                      <Heart className="w-4 h-4" fill={showFavoritesOnly ? '#ef4444' : 'none'} />
                      Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                    </button>
                    {languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setShowFavoritesOnly(false);
                          setIsFilterDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: selectedLanguage === lang && !showFavoritesOnly ? focusBorder : inputText }}
                      >
                        {renderLanguageIcon(lang, { className: 'w-4 h-4' })}
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Buttons */}
              <div className="hidden md:flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedLanguage('all');
                    setShowFavoritesOnly(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${selectedLanguage === 'all' && !showFavoritesOnly ? '' : 'border'
                    }`}
                  style={
                    selectedLanguage === 'all' && !showFavoritesOnly
                      ? { background: colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8'), color: '#ffffff' }
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
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${showFavoritesOnly ? '' : 'border'
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
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${selectedLanguage === lang && !showFavoritesOnly ? '' : 'border'
                        }`}
                      style={
                        selectedLanguage === lang && !showFavoritesOnly
                          ? { background: colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8'), color: '#ffffff' }
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
            </>
          )}
        </div>

        {/* Password gate & Add button */}
        {!isAuthLoading && (
          <div className="w-full mb-6 md:mb-8">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg border" style={{ background: pageBackground, borderColor: inputBorder }}>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm font-medium mb-1" style={{ color: buttonText }}>Password to add or edit snippets</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUnlock())}
                      placeholder="Enter password"
                      className="search-input w-full px-3 py-2 rounded border text-sm focus:outline-none cursor-pointer"
                      style={{ background: inputBackground, borderColor: inputBorder, color: inputText }}
                    />
                  </div>
                  <button
                    onClick={handleUnlock}
                    disabled={unlockLoading}
                    className="px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer disabled:opacity-60"
                    style={{ background: focusBorder, color: '#fff' }}
                  >
                    <Unlock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{unlockLoading ? 'Checking…' : 'Unlock editing'}</span>
                    <span className="sm:hidden">{unlockLoading ? 'Checking…' : 'Unlock'}</span>
                  </button>
                </div>
                {loginError && (
                  <p className="text-xs md:text-sm px-3 md:px-4" style={{ color: '#ef4444' }}>
                    {loginError}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Mobile: Grouped buttons with theme */}
                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={handleOpenModal}
                    className="flex-1 px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    style={{
                      background: focusBorder,
                      color: '#fff',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => {
                      const schemes = ['ayu', 'vscode', 'light'];
                      const currentIndex = schemes.indexOf(colorScheme);
                      const nextIndex = (currentIndex + 1) % schemes.length;
                      setColorScheme(schemes[nextIndex]);
                    }}
                    className="p-2 border rounded-lg transition-colors cursor-pointer flex-shrink-0"
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
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-lg text-xs font-medium flex items-center justify-center cursor-pointer transition-colors border flex-shrink-0"
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
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Desktop: Separate buttons (like before) */}
                <div className="hidden md:flex items-center justify-between gap-3">
                  <button
                    onClick={handleOpenModal}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
                    className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors border"
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
                  >
                    <Lock className="w-4 h-4" />
                    Lock
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Add/Edit Snippet Modal */}
        {isAuthenticated && (
          <AddSnippetModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={handleCloseModal}
            snippet={editingSnippet}
            onDelete={handleDeleteSnippet}
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
            <MasonryLayout snippets={filteredSnippets} onEdit={handleEditSnippet} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetsPage;
