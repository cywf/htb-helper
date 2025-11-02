import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  diagrams?: string[];
}

export default function MermaidViewer({ diagrams = [] }: MermaidViewerProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [diagramContent, setDiagramContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid with dark theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    });

    // Select first diagram by default
    if (diagrams.length > 0 && !selectedDiagram) {
      setSelectedDiagram(diagrams[0]);
    }
  }, [diagrams]);

  useEffect(() => {
    if (selectedDiagram) {
      loadDiagram(selectedDiagram);
    }
  }, [selectedDiagram]);

  const loadDiagram = async (diagramPath: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/htb-helper/diagrams/${diagramPath}`);
      if (!response.ok) {
        throw new Error('Failed to load diagram');
      }

      const content = await response.text();
      setDiagramContent(content);

      // Render mermaid diagram
      if (containerRef.current) {
        containerRef.current.innerHTML = content;
        await mermaid.run({
          querySelector: '#mermaid-container',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (diagrams.length === 0) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-2xl font-bold mb-2">No Diagrams Found</h3>
          <p className="opacity-70 mb-6">
            There are currently no Mermaid diagrams in this repository.
          </p>
          <div className="card bg-base-300 max-w-2xl mx-auto">
            <div className="card-body text-left">
              <h4 className="font-bold mb-2">How to add diagrams:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
                <li>Create a <code className="bg-base-100 px-2 py-1 rounded">.mmd</code> file in the <code className="bg-base-100 px-2 py-1 rounded">mermaid/</code> directory</li>
                <li>Use Mermaid syntax to define your diagram</li>
                <li>Commit and push your changes</li>
                <li>The CI pipeline will automatically make it available here</li>
              </ol>
              <div className="mt-4">
                <a
                  href="https://mermaid.js.org/intro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  Learn Mermaid Syntax
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Diagram List */}
      <aside className="lg:col-span-1">
        <div className="card bg-base-200 shadow-md sticky top-20">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Diagrams</h2>
            <ul className="menu menu-sm p-0">
              {diagrams.map((diagram) => (
                <li key={diagram}>
                  <button
                    onClick={() => setSelectedDiagram(diagram)}
                    className={selectedDiagram === diagram ? 'active' : ''}
                  >
                    {diagram.replace('.mmd', '')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Diagram Viewer */}
      <div className="lg:col-span-3">
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">
                {selectedDiagram?.replace('.mmd', '') || 'Select a diagram'}
              </h2>
              {selectedDiagram && (
                <a
                  href={`https://github.com/cywf/htb-helper/blob/main/mermaid/${selectedDiagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Source
                </a>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            )}

            {error && (
              <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error loading diagram: {error}</span>
              </div>
            )}

            {!loading && !error && (
              <div
                id="mermaid-container"
                ref={containerRef}
                className="bg-base-300 p-6 rounded-lg overflow-x-auto"
              >
                {/* Mermaid diagram will be rendered here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
