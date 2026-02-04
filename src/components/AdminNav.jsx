import { NavLink } from 'react-router-dom';
import { useSnippets } from '../context/snippetContext';

/**
 * Navigation links for admin content (Snippets, Words, Messages, Prompts, Instructions).
 * Only visible when authenticated.
 */
const AdminNav = () => {
  const { isAuthenticated, isAuthLoading } = useSnippets();

  if (isAuthLoading || !isAuthenticated) return null;

  const base = 'px-3 py-2 rounded-lg text-sm font-medium transition-colors';
  const active = 'bg-[#FF8F40] text-white';
  const inactive = 'text-[#8b949e] hover:text-[#e5e7eb] hover:bg-[#1a1f2e]';

  return (
    <nav className="flex flex-wrap items-center gap-1 mb-4 md:mb-6" style={{ color: '#e5e7eb' }}>
      <NavLink
        to="/snippets"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Code
      </NavLink>
      <NavLink
        to="/words"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Words
      </NavLink>
      <NavLink
        to="/messages"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Messages
      </NavLink>
      <NavLink
        to="/talk"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Talk
      </NavLink>
      <NavLink
        to="/instructions"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Instructions
      </NavLink>
      <NavLink
        to="/prompts"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        Prompts
      </NavLink>
    </nav>
  );
};

export default AdminNav;
