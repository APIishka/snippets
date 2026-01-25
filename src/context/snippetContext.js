import { createContext, useContext } from 'react';

export const SnippetContext = createContext(null);

export const useSnippets = () => {
  const context = useContext(SnippetContext);
  if (!context) {
    throw new Error('useSnippets must be used within SnippetProvider');
  }
  return context;
};
