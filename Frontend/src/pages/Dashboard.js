import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const FILTERS = [
  { value: 'toutes', label: 'Toutes' },
  { value: 'a faire', label: 'A faire' },
  { value: 'en cours', label: 'En cours' },
  { value: 'termine', label: 'Terminees' },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('toutes');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des taches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const { data } = await api.post('/tasks', payload);
      setTasks((prev) => [data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la creation de la tache.');
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise a jour.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const filteredTasks = filter === 'toutes' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mes taches</h1>
        <div>
          <span className="user-email">{user?.email}</span>
          <button onClick={logout}>Deconnexion</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <TaskForm onCreate={handleCreate} />

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? 'active' : ''}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <TaskList tasks={filteredTasks} onChangeStatus={handleChangeStatus} onDelete={handleDelete} />
      )}
    </div>
  );
}
