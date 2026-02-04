import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSnippets } from '../context/snippetContext';
import { getThemeColors } from '../utils/themeColors';

const NAV_LINKS = [
  { to: '/snippets', label: 'Code' },
  { to: '/words', label: 'Words' },
  { to: '/messages', label: 'Messages' },
  { to: '/talk', label: 'Talk' },
  { to: '/instructions', label: 'Instructions' },
  { to: '/prompts', label: 'Prompts' },
];

/**
 * Desktop: floating pill nav. Mobile: burger button that opens a bottom-to-top sheet with links.
 */
const BurgerNav = () => {
  const { colorScheme, isAuthenticated, isAuthLoading } = useSnippets();
  const location = useLocation();
  const theme = getThemeColors(colorScheme);
  const text = theme.textColor;
  const accent = theme.focusBorder;
  const border = theme.inputBorder;

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!isAuthLoading && !isAuthenticated) return null;

  return (
    <>
      {/* Desktop: floating pill nav (hidden on small screens) */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center justify-center gap-1.5 px-1.5 py-1.5"
        aria-label="Main navigation"
      >
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border border-white/10 ${isActive ? '' : 'hover:bg-white/5'}`
            }
            style={({ isActive }) => ({
              color: isActive ? '#fff' : text,
              background: isActive ? accent : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: isActive ? `0 0 0 1px ${accent}` : '0 2px 12px rgba(0,0,0,0.15)',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile: burger button (visible only on small screens) */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-lg border shadow-lg cursor-pointer transition-colors hover:opacity-90 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.12)',
            color: text,
          }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile: bottom-to-top dropdown sheet */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTop: `1px solid ${border}`,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border }}>
              <span className="text-sm font-semibold" style={{ color: text }}>Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg cursor-pointer transition-colors"
                style={{ color: text }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 pb-6 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? '' : 'active:opacity-90'}`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? accent : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : text,
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
    </>
  );
};

export default BurgerNav;
