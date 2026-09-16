import React from 'react';

const STATUSES = ['a faire', 'en cours', 'termine'];
const STATUS_LABELS = {
  'a faire': 'A faire',
  'en cours': 'En cours',
  termine: 'Termine',
};

export default function TaskItem({ task, onChangeStatus, onDelete }) {
  const handleCycleStatus = () => {
    const currentIndex = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];
    onChangeStatus(task._id, nextStatus);
  };

  return (
    <li className={`task-item status-${task.status.replace(' ', '-')}`}>
      <div className="task-info">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <span className="badge">{STATUS_LABELS[task.status]}</span>
      </div>
      <div className="task-actions">
        <button onClick={handleCycleStatus}>Changer statut</button>
        <button className="danger" onClick={() => onDelete(task._id)}>
          Supprimer
        </button>
      </div>
    </li>
  );
}
