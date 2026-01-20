// Snippet data imports
import snippet001Data from './data/snippet-001.json';
import snippet002Data from './data/snippet-002.json';
import snippet003Data from './data/snippet-003.json';
import snippet004Data from './data/snippet-004.json';
import snippet005Data from './data/snippet-005.json';
import snippet006Data from './data/snippet-006.json';
import snippet007Data from './data/snippet-007.json';
import snippet008Data from './data/snippet-008.json';
import snippet009Data from './data/snippet-009.json';
import snippet010Data from './data/snippet-010.json';
import snippet011Data from './data/snippet-011.json';
import snippet012Data from './data/snippet-012.json';
import snippet013Data from './data/snippet-013.json';
import snippet014Data from './data/snippet-014.json';
import snippet015Data from './data/snippet-015.json';
import snippet016Data from './data/snippet-016.json';
import snippet017Data from './data/snippet-017.json';
import snippet018Data from './data/snippet-018.json';
import snippet019Data from './data/snippet-019.json';
import snippet020Data from './data/snippet-020.json';
import snippet021Data from './data/snippet-021.json';
import snippet022Data from './data/snippet-022.json';
import snippet023Data from './data/snippet-023.json';
import snippet024Data from './data/snippet-024.json';
import snippet025Data from './data/snippet-025.json';
import snippet026Data from './data/snippet-026.json';

// Code file imports
import snippet001Code from './code/snippet-001.js?raw';
import snippet002Code from './code/snippet-002.js?raw';
import snippet003Code from './code/snippet-003.js?raw';
import snippet004Code from './code/snippet-004.py?raw';
import snippet005Code from './code/snippet-005.py?raw';
import snippet006Code from './code/snippet-006.py?raw';
import snippet007Code from './code/snippet-007.js?raw';
import snippet008Code from './code/snippet-008.py?raw';
import snippet009Code from './code/snippet-009.js?raw';
import snippet010Code from './code/snippet-010.py?raw';
import snippet011Code from './code/snippet-011.js?raw';
import snippet012Code from './code/snippet-012.py?raw';
import snippet013Code from './code/snippet-013.js?raw';
import snippet014Code from './code/snippet-014.js?raw';
import snippet015Code from './code/snippet-015.js?raw';
import snippet016Code from './code/snippet-016.js?raw';
import snippet017Code from './code/snippet-017.js?raw';
import snippet018Code from './code/snippet-018.js?raw';
import snippet019Code from './code/snippet-019.js?raw';
import snippet020Code from './code/snippet-020.js?raw';
import snippet021Code from './code/snippet-021.js?raw';
import snippet022Code from './code/snippet-022.js?raw';
import snippet023Code from './code/snippet-023.js?raw';
import snippet024Code from './code/snippet-024.js?raw';
import snippet025Code from './code/snippet-025.js?raw';
import snippet026Code from './code/snippet-026.js?raw';

// Map code files to their data
const codeFiles = {
  'snippet-001.js': snippet001Code,
  'snippet-002.js': snippet002Code,
  'snippet-003.js': snippet003Code,
  'snippet-004.py': snippet004Code,
  'snippet-005.py': snippet005Code,
  'snippet-006.py': snippet006Code,
  'snippet-007.js': snippet007Code,
  'snippet-008.py': snippet008Code,
  'snippet-009.js': snippet009Code,
  'snippet-010.py': snippet010Code,
  'snippet-011.js': snippet011Code,
  'snippet-012.py': snippet012Code,
  'snippet-013.js': snippet013Code,
  'snippet-014.js': snippet014Code,
  'snippet-015.js': snippet015Code,
  'snippet-016.js': snippet016Code,
  'snippet-017.js': snippet017Code,
  'snippet-018.js': snippet018Code,
  'snippet-019.js': snippet019Code,
  'snippet-020.js': snippet020Code,
  'snippet-021.js': snippet021Code,
  'snippet-022.js': snippet022Code,
  'snippet-023.js': snippet023Code,
  'snippet-024.js': snippet024Code,
  'snippet-025.js': snippet025Code,
  'snippet-026.js': snippet026Code,
};

// Combine data and code
const snippetsData = [
  snippet001Data,
  snippet002Data,
  snippet003Data,
  snippet004Data,
  snippet005Data,
  snippet006Data,
  snippet007Data,
  snippet008Data,
  snippet009Data,
  snippet010Data,
  snippet011Data,
  snippet012Data,
  snippet013Data,
  snippet014Data,
  snippet015Data,
  snippet016Data,
  snippet017Data,
  snippet018Data,
  snippet019Data,
  snippet020Data,
  snippet021Data,
  snippet022Data,
  snippet023Data,
  snippet024Data,
  snippet025Data,
  snippet026Data,
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
