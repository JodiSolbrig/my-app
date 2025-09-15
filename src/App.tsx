import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (!title || !dueDate) return;
    if (editingId) {
      setTasks(tasks.map(task => task.id === editingId ? { ...task, title, dueDate, priority } : task));
      setEditingId(null);
    } else {
      setTasks([...tasks, { id: uuidv4(), title, dueDate, priority }]);
    }
    setTitle('');
    setDueDate('');
    setPriority('Medium');
  };

  const editTask = (task: Task) => {
    setTitle(task.title);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setEditingId(task.id);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <h1>Legal Document Task Tracker</h1>
      <div className="form">
        <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button onClick={addOrUpdateTask}>{editingId ? 'Update' : 'Add'} Task</button>
      </div>
      <ul>
        <AnimatePresence>
          {tasks.map(task => (
            <motion.li key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`priority-${task.priority.toLowerCase()}`}>
              <span>{task.title} - Due: {task.dueDate} - Priority: {task.priority}</span>
              <button onClick={() => editTask(task)}>Edit</button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default App;