import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { ThemeProvider } from 'styled-components';
import './App.css';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

const lightTheme = {
  background: '#fff',
  text: '#333',
  card: '#f9f9f9',
  shadow: 'rgba(0,0,0,0.1)',
};

const darkTheme = {
  background: '#333',
  text: '#fff',
  card: '#444',
  shadow: 'rgba(255,255,255,0.1)',
};

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('theme', theme);
  }, [tasks, theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const addOrUpdateTask = () => {
    if (!title || !dueDate) return;
    if (editingId) {
      setTasks(tasks.map(task => task.id === editingId ? { ...task, title, dueDate, priority } : task));      
      setEditingId(null);
    } else {
      setTasks([...tasks, { id: uuidv4(), title, dueDate, priority, completed: false }]);
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
    // No change to completed, as it's not edited here
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleCompleted = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <div className="app" data-theme={theme}>
        <ThemeToggle onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </ThemeToggle>
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
              <motion.li
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`priority-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}`}
              >
                <input type="checkbox" checked={task.completed} onChange={() => toggleCompleted(task.id)} />
                <span>{task.title} - Due: {task.dueDate} - Priority: {task.priority}</span>
                <button onClick={() => editTask(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </ThemeProvider>
  );
};

export default App;