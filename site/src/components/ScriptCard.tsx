import { useState } from 'react';

interface ScriptCardProps {
  filename: string;
  path: string;
  description: string;
  language: string;
  purpose?: string;
  usage?: string;
}

export default function ScriptCard({ filename, path, description, language, purpose, usage }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const languageColors: Record<string, string> = {
    python: 'badge-info',
    shell: 'badge-success',
    bash: 'badge-success',
    javascript: 'badge-warning',
    other: 'badge-neutral',
  };

  const purposeColors: Record<string, string> = {
    revshell: 'badge-error',
    fuzzing: 'badge-warning',
    enum: 'badge-info',
    other: 'badge-neutral',
  };

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">
          {filename}
          <div className="badge badge-sm ml-auto">{path}</div>
        </h3>
        
        <p className="text-sm opacity-80">{description}</p>

        <div className="flex gap-2 mt-2 flex-wrap">
          <span className={`badge ${languageColors[language.toLowerCase()] || languageColors.other}`}>
            {language}
          </span>
          {purpose && (
            <span className={`badge ${purposeColors[purpose.toLowerCase()] || purposeColors.other}`}>
              {purpose}
            </span>
          )}
        </div>

        {usage && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold opacity-70">Usage:</span>
              <button
                onClick={() => handleCopy(usage)}
                className="btn btn-xs btn-ghost"
                aria-label="Copy usage command"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <pre className="bg-base-300 p-3 rounded text-xs overflow-x-auto"><code>{usage}</code></pre>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <a
            href={`https://github.com/cywf/htb-helper/blob/main/${path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
