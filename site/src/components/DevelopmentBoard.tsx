import { useEffect, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';

interface ProjectItem {
  title: string;
  status: string;
  labels: string[];
  assignees: string[];
  url: string;
}

export default function DevelopmentBoard() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/htb-helper/data/projects.json');
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <SkeletonLoader count={6} />;
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error loading project data: {error}</span>
      </div>
    );
  }

  const statuses = ['todo', 'in-progress', 'done'];
  const statusLabels: Record<string, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status.toLowerCase() === status || item.status.toLowerCase().replace(/\s+/g, '-') === status);
  };

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statuses.map(status => (
          <div key={status} className="space-y-4">
            <div className="card bg-base-200 shadow-md">
              <div className="card-body p-4">
                <h3 className="font-bold text-lg">{statusLabels[status]}</h3>
                <div className="badge badge-sm">{getItemsByStatus(status).length} items</div>
              </div>
            </div>

            <div className="space-y-3">
              {getItemsByStatus(status).length === 0 ? (
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body p-4 text-center opacity-50">
                    <p className="text-sm">No items</p>
                  </div>
                </div>
              ) : (
                getItemsByStatus(status).map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card bg-base-200 shadow-sm hover:shadow-md hover:bg-base-300 transition-all block"
                  >
                    <div className="card-body p-4">
                      <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                      
                      {item.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.labels.map((label, i) => (
                            <span key={i} className="badge badge-xs badge-outline">{label}</span>
                          ))}
                        </div>
                      )}

                      {item.assignees.length > 0 && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{item.assignees.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
