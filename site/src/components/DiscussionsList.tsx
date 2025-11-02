import { useEffect, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';

interface Discussion {
  title: string;
  url: string;
  author: string;
  category: string;
  createdAt: string;
  commentsCount: number;
}

export default function DiscussionsList() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch('/htb-helper/data/discussions.json');
        if (!response.ok) {
          throw new Error('Failed to fetch discussions');
        }
        const data = await response.json();
        setDiscussions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  if (loading) {
    return <SkeletonLoader count={5} />;
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error loading discussions: {error}</span>
      </div>
    );
  }

  const categories = Array.from(new Set(discussions.map(d => d.category)));

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = searchQuery === '' ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || discussion.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Search discussions..."
                className="input input-bordered"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm opacity-70 mt-2">
            Showing {filteredDiscussions.length} of {discussions.length} discussions
          </div>
        </div>
      </div>

      {/* Discussions List */}
      {filteredDiscussions.length === 0 ? (
        <div className="alert shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No discussions match your filters.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion, index) => (
            <a
              key={index}
              href={discussion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-base-200 shadow-md hover:shadow-lg hover:bg-base-300 transition-all"
            >
              <div className="card-body">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="card-title text-lg mb-2">{discussion.title}</h3>
                    <div className="flex gap-4 text-sm opacity-70">
                      <span>By {discussion.author}</span>
                      <span>•</span>
                      <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{discussion.commentsCount} comments</span>
                    </div>
                  </div>
                  <div className="badge badge-primary">{discussion.category}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
