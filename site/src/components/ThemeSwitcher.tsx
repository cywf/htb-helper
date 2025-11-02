import { useEffect, useState } from 'react';

const THEMES = [
  'nightfall',
  'dracula',
  'cyberpunk',
  'dark-neon',
  'hackerman',
  'gamecore',
  'neon-accent',
] as const;

type Theme = typeof THEMES[number];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('nightfall');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or use default
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme && THEMES.includes(storedTheme)) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      // Use default theme
      const defaultTheme = (import.meta.env.DEFAULT_THEME as Theme) || 'nightfall';
      setTheme(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost gap-2" aria-label="Select theme">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block w-5 h-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          ></path>
        </svg>
        <span className="hidden sm:inline">{theme}</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
      >
        {THEMES.map((t) => (
          <li key={t}>
            <button
              className={`btn btn-sm btn-block btn-ghost justify-start ${
                theme === t ? 'btn-active' : ''
              }`}
              onClick={() => handleThemeChange(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
