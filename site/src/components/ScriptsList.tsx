import { useEffect, useState } from 'react';
import ScriptCard from './ScriptCard';
import SkeletonLoader from './SkeletonLoader';

interface Script {
  filename: string;
  path: string;
  description: string;
  language: string;
  purpose?: string;
  usage?: string;
}

export default function ScriptsList() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/htb-helper/data/scripts.json');
        if (!response.ok) {
          throw new Error('Failed to fetch scripts');
        }
        const data = await response.json();
        setScripts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const languages = Array.from(new Set(scripts.map(s => s.language)));
  const purposes = Array.from(new Set(scripts.map(s => s.purpose).filter(Boolean)));

  const filteredScripts = scripts.filter(script => {
    const matchesLanguage = languageFilter === 'all' || script.language.toLowerCase() === languageFilter.toLowerCase();
    const matchesPurpose = purposeFilter === 'all' || script.purpose?.toLowerCase() === purposeFilter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      script.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLanguage && matchesPurpose && matchesSearch;
  });

  if (loading) {
    return <SkeletonLoader count={6} />;
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error loading scripts: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Search scripts..."
                className="input input-bordered"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Language Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Language</span>
              </label>
              <select
                className="select select-bordered"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Purpose Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Purpose</span>
              </label>
              <select
                className="select select-bordered"
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
              >
                <option value="all">All Purposes</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm opacity-70 mt-2">
            Showing {filteredScripts.length} of {scripts.length} scripts
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      {filteredScripts.length === 0 ? (
        <div className="alert shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No scripts match your filters. Try adjusting your search criteria.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScripts.map((script, index) => (
            <ScriptCard key={index} {...script} />
          ))}
        </div>
      )}
    </div>
  );
}
