import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onChangeStatus, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty-state">Aucune tache a afficher.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onChangeStatus={onChangeStatus} onDelete={onDelete} />
      ))}
    </ul>
  );
}
