import { useState, useRef, useEffect } from 'react';
import { Search, Heart, Filter, X, ChevronDown, Tag } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';

/**
 * Reusable layout for admin content pages: burger + search (same length as code page) + theme,
 * then tag/category filters, sort, and list area.
 * categoryAsDropdown: render category as a <select> (e.g. for messages page).
 * showFavoritesOnly, onToggleFavorites, favoritesCount: show Favorites filter button (like code page).
 */
const ContentListLayout = ({
  title,
  searchPlaceholder = 'Search…',
  searchValue = '',
  onSearchChange,
  tags = [],
  selectedTags = [],
  onToggleTag,
  sortBy = 'dateAdded',
  onSortChange,
  categories = null,
  selectedCategory = null,
  onCategoryChange = null,
  categoryAsDropdown = false,
  showFavoritesOnly = null,
  onToggleFavorites = null,
  favoritesCount = 0,
  hideSort = false,
  filtersInModalOnMobile = false,
  filterModalOpen: filterModalOpenProp = null,
  onFilterModalOpenChange = null,
  hideCountInFilterRow = false,
  onClearFilters = null,
  filterLanguages = null,
  filterSelectedLanguage = 'all',
  onFilterLanguageChange = null,
  children,
  emptyMessage = 'No items',
  loading,
  error,
  onRetry,
  totalCount,
  filteredCount,
  extraFilters = null,
}) => {
  const { colorScheme, setColorScheme } = useSnippets();
  const theme = getThemeColors(colorScheme);
  const pageBg = theme.pageBackground;
  const inputBg = theme.inputBackground;
  const border = theme.inputBorder;
  const text = theme.textColor;
  const muted = theme.buttonText;
  const accent = theme.focusBorder;
  const placeholderColor = theme.placeholderColor;
  const [filterModalOpenInternal, setFilterModalOpenInternal] = useState(false);
  const isFilterModalControlled = filterModalOpenProp !== null && filterModalOpenProp !== undefined && typeof onFilterModalOpenChange === 'function';
  const filterModalOpen = isFilterModalControlled ? filterModalOpenProp : filterModalOpenInternal;
  const setFilterModalOpen = isFilterModalControlled ? onFilterModalOpenChange : setFilterModalOpenInternal;
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const tagsDropdownRef = useRef(null);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const categoriesDropdownRef = useRef(null);

  useEffect(() => {
    if (!tagsDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(e.target)) {
        setTagsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [tagsDropdownOpen]);

  useEffect(() => {
    if (!categoriesDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(e.target)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [categoriesDropdownOpen]);

  const hasAnyFilters = (categories?.length > 0 && onCategoryChange) || (showFavoritesOnly != null && onToggleFavorites) || tags.length > 0 || (filterLanguages?.length > 0 && onFilterLanguageChange) || (onClearFilters != null && (showFavoritesOnly != null || tags.length > 0 || (filterLanguages?.length > 0 && filterSelectedLanguage !== 'all')));

  const filterControls = (
    <>
      {onClearFilters != null && (
        <button
          type="button"
          onClick={() => onClearFilters()}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${!(showFavoritesOnly || (filterLanguages?.length > 0 && filterSelectedLanguage !== 'all') || (categories?.length > 0 && onCategoryChange && selectedCategory)) ? '' : 'border'}`}
          style={
            !(showFavoritesOnly || (filterLanguages?.length > 0 && filterSelectedLanguage !== 'all') || (categories?.length > 0 && onCategoryChange && selectedCategory))
              ? { background: accent, color: '#fff' }
              : { background: pageBg, borderColor: border, color: text }
          }
          onMouseEnter={(e) => {
            if (showFavoritesOnly || (filterLanguages?.length > 0 && filterSelectedLanguage !== 'all') || (categories?.length > 0 && onCategoryChange && selectedCategory)) {
              e.currentTarget.style.color = theme.buttonHoverText;
              e.currentTarget.style.borderColor = theme.buttonHoverBorder;
            }
          }}
          onMouseLeave={(e) => {
            if (showFavoritesOnly || (filterLanguages?.length > 0 && filterSelectedLanguage !== 'all') || (categories?.length > 0 && onCategoryChange && selectedCategory)) {
              e.currentTarget.style.color = text;
              e.currentTarget.style.borderColor = border;
            }
          }}
        >
          All
        </button>
      )}
      {categories?.length > 0 && onCategoryChange && categoryAsDropdown && showFavoritesOnly != null && onToggleFavorites && (
        <button
          type="button"
          onClick={() => onToggleFavorites()}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${showFavoritesOnly ? '' : 'border'}`}
          style={
            showFavoritesOnly
              ? { background: '#ef4444', color: '#fff' }
              : { background: pageBg, borderColor: border, color: text }
          }
          onMouseEnter={(e) => {
            if (!showFavoritesOnly) {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }
          }}
          onMouseLeave={(e) => {
            if (!showFavoritesOnly) {
              e.currentTarget.style.color = text;
              e.currentTarget.style.borderColor = border;
            }
          }}
        >
          <Heart className="w-4 h-4" fill={showFavoritesOnly ? '#fff' : 'none'} />
          Favorites {favoritesCount > 0 && `(${favoritesCount})`}
        </button>
      )}
      {categories?.length > 0 && onCategoryChange && !categoryAsDropdown && (
        <>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${!selectedCategory ? '' : 'border'}`}
            style={
              !selectedCategory
                ? { background: accent, color: '#fff' }
                : { background: pageBg, borderColor: border, color: text }
            }
            onMouseEnter={(e) => {
              if (selectedCategory) {
                e.currentTarget.style.color = theme.buttonHoverText;
                e.currentTarget.style.borderColor = theme.buttonHoverBorder;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory) {
                e.currentTarget.style.color = text;
                e.currentTarget.style.borderColor = border;
              }
            }}
          >
            All
          </button>
          {showFavoritesOnly != null && onToggleFavorites && (
            <button
              type="button"
              onClick={() => onToggleFavorites()}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${showFavoritesOnly ? '' : 'border'}`}
              style={
                showFavoritesOnly
                  ? { background: '#ef4444', color: '#fff' }
                  : { background: pageBg, borderColor: border, color: text }
              }
              onMouseEnter={(e) => {
                if (!showFavoritesOnly) {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#ef4444';
                }
              }}
              onMouseLeave={(e) => {
                if (!showFavoritesOnly) {
                  e.currentTarget.style.color = text;
                  e.currentTarget.style.borderColor = border;
                }
              }}
            >
              <Heart className="w-4 h-4" fill={showFavoritesOnly ? '#fff' : 'none'} />
              Favorites {favoritesCount > 0 && `(${favoritesCount})`}
            </button>
          )}
          {categories.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${selected ? '' : 'border'}`}
                style={
                  selected
                    ? { background: accent, color: '#fff' }
                    : { background: pageBg, borderColor: border, color: text }
                }
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.color = theme.buttonHoverText;
                    e.currentTarget.style.borderColor = theme.buttonHoverBorder;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.color = text;
                    e.currentTarget.style.borderColor = border;
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </>
      )}
      {categories?.length == null || !onCategoryChange ? (
        showFavoritesOnly != null && onToggleFavorites && (
          <button
            type="button"
            onClick={() => onToggleFavorites()}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${showFavoritesOnly ? '' : 'border'}`}
            style={
              showFavoritesOnly
                ? { background: '#ef4444', color: '#fff' }
                : { background: pageBg, borderColor: border, color: text }
            }
            onMouseEnter={(e) => {
              if (!showFavoritesOnly) {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFavoritesOnly) {
                e.currentTarget.style.color = text;
                e.currentTarget.style.borderColor = border;
              }
            }}
          >
            <Heart className="w-4 h-4" fill={showFavoritesOnly ? '#fff' : 'none'} />
            Favorites {favoritesCount > 0 && `(${favoritesCount})`}
          </button>
        )
      ) : null}
      {categories?.length > 0 && onCategoryChange && categoryAsDropdown && (
        <div className="relative" ref={categoriesDropdownRef}>
          <button
            type="button"
            onClick={() => setCategoriesDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border cursor-pointer hover:opacity-90 min-w-[6rem] justify-between"
            style={{
              background: selectedCategory ? accent : pageBg,
              borderColor: border,
              color: selectedCategory ? '#fff' : text,
            }}
          >
            <span className="truncate">Categories</span>
            {selectedCategory && (
              <span className="shrink-0 text-xs opacity-90">(1)</span>
            )}
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {categoriesDropdownOpen && (
            <div
              className="scrollbar-subtle absolute top-full left-0 mt-1 border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto min-w-[10rem]"
              style={{ background: pageBg, borderColor: border }}
            >
              {categories.map((cat) => {
                const selected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onCategoryChange(cat);
                      setCategoriesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity border-b last:border-b-0"
                    style={{
                      borderColor: border,
                      background: selected ? accent : 'transparent',
                      color: selected ? '#fff' : text,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {tags.length > 0 && onToggleTag && (
        <div className="relative" ref={tagsDropdownRef}>
          <button
            type="button"
            onClick={() => setTagsDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border cursor-pointer hover:opacity-90 min-w-[6rem] justify-between"
            style={{
              background: selectedTags.length > 0 ? accent : pageBg,
              borderColor: border,
              color: selectedTags.length > 0 ? '#fff' : text,
            }}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">Tags</span>
            {selectedTags.length > 0 && (
              <span className="shrink-0 text-xs opacity-90">({selectedTags.length})</span>
            )}
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {tagsDropdownOpen && (
            <div
              className="scrollbar-subtle absolute top-full left-0 mt-1 border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto min-w-[10rem]"
              style={{ background: pageBg, borderColor: border }}
            >
              {tags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onToggleTag(tag);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity border-b last:border-b-0"
                    style={{
                      borderColor: border,
                      background: selected ? accent : 'transparent',
                      color: selected ? '#fff' : text,
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {filterLanguages?.length > 0 && onFilterLanguageChange && (
        <>
          {filterLanguages.map((lang) => {
            const selected = filterSelectedLanguage === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onFilterLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${selected ? '' : 'border'}`}
                style={
                  selected
                    ? { background: accent, color: '#fff' }
                    : { background: pageBg, borderColor: border, color: text }
                }
              >
                {lang}
              </button>
            );
          })}
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen w-full" style={{ background: pageBg, color: text }}>
      <style>{`
        .content-search-input::placeholder {
          color: ${placeholderColor} !important;
          opacity: 1;
          font-size: 0.875rem;
        }
      `}</style>
      {/* Main content with padding */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-20 md:pb-24">
      {/* Search */}
      <div className="w-full mb-4 md:mb-5 space-y-2 md:space-y-3">
        <div className="w-full flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0 w-full">
            <Search
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5"
              style={{ color: theme.inputPlaceholder }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="content-search-input w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-4 border rounded-lg text-sm md:text-base font-medium focus:outline-none transition-colors"
              style={{
                background: inputBg,
                borderColor: border,
                color: theme.inputText,
              }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = border; }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {extraFilters}
          {filtersInModalOnMobile && hasAnyFilters ? (
            <>
              {!isFilterModalControlled && (
                <div className="md:hidden">
                  <button
                    type="button"
                    onClick={() => setFilterModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border cursor-pointer hover:opacity-90"
                    style={{ background: pageBg, borderColor: border, color: text }}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>
              )}
              <div className="hidden md:flex flex-wrap items-center gap-2">
                {filterControls}
              </div>
            </>
          ) : (
            hasAnyFilters ? filterControls : null
          )}
          {!hideCountInFilterRow && (totalCount != null || filteredCount != null) && (
            <span className="text-xs tabular-nums shrink-0" style={{ color: muted }}>
              {filteredCount != null && totalCount != null ? `${filteredCount} of ${totalCount}` : totalCount != null ? `${totalCount} items` : ''}
            </span>
          )}
          {!hideSort && (
            <div className="flex-1 min-w-0 flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="w-full md:w-40 md:shrink-0 min-w-0 max-w-full px-4 py-2 rounded-lg font-semibold text-sm border cursor-pointer focus:outline-none transition-colors"
                style={{
                  background: inputBg,
                  borderColor: border,
                  color: theme.inputText,
                }}
                onFocus={(e) => { e.target.style.borderColor = accent; }}
                onBlur={(e) => { e.target.style.borderColor = border; }}
              >
                <option value="dateAdded">Newest first</option>
                <option value="title">A–Z</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm" style={{ color: muted }}>
          Loading…
        </div>
      )}
      {error && (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded text-sm cursor-pointer"
              style={{ background: accent, color: '#fff' }}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {!loading && !error && children}
      </div>

      {filtersInModalOnMobile && filterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setFilterModalOpen(false)}
          role="presentation"
        >
          <div
            className="rounded-lg border w-full max-w-md shadow-xl p-4"
            style={{ background: pageBg, borderColor: border, color: text }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded hover:opacity-80"
                style={{ color: muted }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {filterControls}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentListLayout;
