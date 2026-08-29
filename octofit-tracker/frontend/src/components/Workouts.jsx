import { useEffect, useMemo, useState } from 'react';

const endpoint = '/api/workouts/';

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
    if ('difficulty' in value) return value.difficulty;
    if ('focus' in value) return value.focus;
    if ('_id' in value) return value._id;
    return JSON.stringify(value);
  }
  return String(value);
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadWorkouts = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (isActive) {
          setWorkouts(getRecords(payload));
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load workouts.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isActive = false;
    };
  }, []);

  const columns = useMemo(() => {
    const firstItem = workouts[0] ?? {};
    return Object.keys(firstItem).filter((key) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key));
  }, [workouts]);

  if (loading) {
    return <div className="route-panel"><p>Loading workouts...</p></div>;
  }

  if (error) {
    return <div className="route-panel"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="route-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Workouts</h2>
        <span className="badge text-bg-primary">{workouts.length} items</span>
      </div>

      {workouts.length === 0 ? (
        <div className="alert alert-info">No workouts found.</div>
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
              {workouts.map((workout) => (
                <tr key={workout._id ?? workout.title}>
                  {columns.map((column) => (
                    <td key={`${workout._id ?? workout.title}-${column}`}>{formatValue(workout[column])}</td>
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
