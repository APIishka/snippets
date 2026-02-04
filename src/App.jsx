import { Routes, Route } from 'react-router-dom';
import { SnippetProvider } from './context/SnippetContext.jsx';
import BurgerNav from './components/BurgerNav';
import HomePage from './pages/HomePage';
import SnippetsPage from './pages/SnippetsPage';
import WordsPage from './pages/WordsPage';
import TextSnippetsPage from './pages/TextSnippetsPage';
import PromptsPage from './pages/PromptsPage';
import InstructionsPage from './pages/InstructionsPage';

const App = () => {
  return (
    <SnippetProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snippets" element={<SnippetsPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/messages" element={<TextSnippetsPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
      </Routes>
      <BurgerNav />
    </SnippetProvider>
  );
};

export default App;