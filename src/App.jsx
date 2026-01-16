import { Routes, Route } from 'react-router-dom';
import { SnippetProvider } from './context/SnippetContext';
import HomePage from './pages/HomePage';
import SnippetsPage from './pages/SnippetsPage';

const App = () => {
  return (
    <SnippetProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snippets" element={<SnippetsPage />} />
      </Routes>
    </SnippetProvider>
  );
};

export default App;