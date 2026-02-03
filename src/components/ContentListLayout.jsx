import { Search } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';

/**
 * Reusable layout for admin content pages: burger + search (same length as code page) + theme,
 * then tag/category filters, sort, and list area.
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
          {categories?.length > 0 && onCategoryChange && (
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
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag?.(tag)}
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
                {tag}
              </button>
            );
          })}
          {(totalCount != null || filteredCount != null) && (
            <span className="text-xs tabular-nums shrink-0" style={{ color: muted }}>
              {filteredCount != null && totalCount != null ? `${filteredCount} of ${totalCount}` : totalCount != null ? `${totalCount} items` : ''}
            </span>
          )}
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
    </div>
  );
};

export default ContentListLayout;
