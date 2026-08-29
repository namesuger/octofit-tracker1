import { useEffect, useMemo, useState } from 'react';

const getApiBaseUrl = () => {
  const codespaceName = import.meta.env.VITE_CODESPACE_NAME;

  return codespaceName
    ? `https://${codespaceName}-8000.app.github.dev/api/teams/`
    : 'http://localhost:8000/api/teams/';
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

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadTeams = async () => {
      try {
        const response = await fetch(getApiBaseUrl());
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (isActive) {
          setTeams(getRecords(payload));
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load teams.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      isActive = false;
    };
  }, []);

  const columns = useMemo(() => {
    const firstItem = teams[0] ?? {};
    return Object.keys(firstItem).filter((key) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key));
  }, [teams]);

  if (loading) {
    return <div className="route-panel"><p>Loading teams...</p></div>;
  }

  if (error) {
    return <div className="route-panel"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="route-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Teams</h2>
        <span className="badge text-bg-primary">{teams.length} items</span>
      </div>

      {teams.length === 0 ? (
        <div className="alert alert-info">No teams found.</div>
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
              {teams.map((team) => (
                <tr key={team._id ?? team.name}>
                  {columns.map((column) => (
                    <td key={`${team._id ?? team.name}-${column}`}>{formatValue(team[column])}</td>
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
