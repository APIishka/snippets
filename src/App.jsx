import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnippetsPage from './pages/SnippetsPage';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          <Link to="/snippets" className="text-blue-600 hover:text-blue-800">Snippets</Link>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/snippets" element={<SnippetsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;