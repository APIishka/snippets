// Snippet data imports
import snippet001Data from './data/snippet-001.json';
import snippet002Data from './data/snippet-002.json';
import snippet003Data from './data/snippet-003.json';
import snippet004Data from './data/snippet-004.json';
import snippet005Data from './data/snippet-005.json';
import snippet006Data from './data/snippet-006.json';

// Code file imports
import snippet001Code from './code/snippet-001.js?raw';
import snippet002Code from './code/snippet-002.js?raw';
import snippet003Code from './code/snippet-003.js?raw';
import snippet004Code from './code/snippet-004.py?raw';
import snippet005Code from './code/snippet-005.py?raw';
import snippet006Code from './code/snippet-006.py?raw';

// Map code files to their data
const codeFiles = {
  'snippet-001.js': snippet001Code,
  'snippet-002.js': snippet002Code,
  'snippet-003.js': snippet003Code,
  'snippet-004.py': snippet004Code,
  'snippet-005.py': snippet005Code,
  'snippet-006.py': snippet006Code,
};

// Combine data and code
const snippetsData = [
  snippet001Data,
  snippet002Data,
  snippet003Data,
  snippet004Data,
  snippet005Data,
  snippet006Data,
];

// Create complete snippet objects
export const snippets = snippetsData.map(snippet => ({
  ...snippet,
  code: codeFiles[snippet.codeFile] || '',
}));

// Get all unique languages
export const getAllLanguages = () => {
  const languages = snippets.map(s => s.language);
  return [...new Set(languages)].sort();
};

// Get all unique tags
export const getAllTags = () => {
  const tags = snippets.flatMap(s => s.tags);
  return [...new Set(tags)].sort();
};

// Get all unique categories
export const getAllCategories = () => {
  const categories = snippets.map(s => s.category).filter(Boolean);
  return [...new Set(categories)].sort();
};

// Get snippet by ID
export const getSnippetById = (id) => {
  return snippets.find(s => s.id === id);
};

// Get recent snippets
export const getRecentSnippets = (count = 5) => {
  return [...snippets]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, count);
};

export default snippets;
