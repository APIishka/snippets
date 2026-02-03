/**
 * Shared filter logic for content types (words, text_snippets, prompts, instructions).
 * Reuses the same search + tags + sort pattern as code snippets.
 *
 * @param {Array} items - List of items (each may have date_added/dateAdded, tags, and searchable fields)
 * @param {Object} options
 * @param {string} options.searchQuery - Search string
 * @param {string[]} options.searchFields - Field names to search in (e.g. ['content', 'translation', 'notes'])
 * @param {string[]} options.selectedTags - Include only items that have all these tags
 * @param {string} options.sortBy - 'dateAdded' | 'title' | or a field name
 * @param {string} [options.dateKey='date_added'] - Key for date (row may use date_added or dateAdded)
 * @param {string} [options.textKey] - Key for primary text when sortBy is 'title' (e.g. 'content', 'text')
 */
export function filterContentItems(items, options = {}) {
  const {
    searchQuery = '',
    searchFields = [],
    selectedTags = [],
    sortBy = 'dateAdded',
    dateKey = 'date_added',
    textKey = 'text',
  } = options;

  let filtered = [...(items || [])];

  if (selectedTags.length > 0) {
    filtered = filtered.filter((item) => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      return selectedTags.every((tag) => tags.includes(tag));
    });
  }

  const q = (searchQuery || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((item) => {
      for (const field of searchFields) {
        const val = item[field];
        if (val != null && String(val).toLowerCase().includes(q)) return true;
      }
      const tags = item.tags;
      if (Array.isArray(tags) && tags.some((t) => String(t).toLowerCase().includes(q))) return true;
      return false;
    });
  }

  const dateField = (item) => (item.dateAdded != null ? item.dateAdded : item[dateKey]);
  const textField = (item) => {
    const t = textKey ? item[textKey] : (item.content != null ? item.content : item.text);
    return t != null ? t : '';
  };

  filtered.sort((a, b) => {
    if (sortBy === 'title' || sortBy === 'content' || sortBy === 'text') {
      return (textField(a) || '').localeCompare(textField(b) || '');
    }
    const tA = new Date(dateField(a) || 0).getTime();
    const tB = new Date(dateField(b) || 0).getTime();
    return tB - tA;
  });

  return filtered;
}
