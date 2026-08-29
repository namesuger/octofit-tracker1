import { useEffect, useMemo, useState } from 'react';

const endpoint = '/api/leaderboard/';

const getApiBaseUrl = () => {
  const codespaceName = import.meta.env.VITE_CODESPACE_NAME;
  const apiBaseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  return apiBaseUrl;
};

const getRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

const formatValue = (value) => {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(', ') || '—';
  }
  if (typeof value === 'object') {
    if ('name' in value) return value.name;
    if ('email' in value) return value.email;
    if ('title' in value) return value.title;
    if ('points' in value) return String(value.points);
    if ('_id' in value) return value._id;
    return JSON.stringify(value);
  }
  return String(value);
};

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (isActive) {
          setEntries(getRecords(payload));
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load leaderboard.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isActive = false;
    };
  }, []);

  const columns = useMemo(() => {
    const firstItem = entries[0] ?? {};
    return Object.keys(firstItem).filter((key) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key));
  }, [entries]);

  if (loading) {
    return <div className="route-panel"><p>Loading leaderboard...</p></div>;
  }

  if (error) {
    return <div className="route-panel"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="route-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Leaderboard</h2>
        <span className="badge text-bg-primary">{entries.length} items</span>
      </div>

      {entries.length === 0 ? (
        <div className="alert alert-info">No leaderboard entries found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id ?? `${entry.rank}-${entry.user}`}>
                  {columns.map((column) => (
                    <td key={`${entry._id ?? entry.rank}-${column}`}>{formatValue(entry[column])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
