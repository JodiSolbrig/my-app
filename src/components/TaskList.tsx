import React, { useState, useEffect, useCallback, useRef } from 'react';
   import axios from 'axios';
   import { useNavigate } from 'react-router-dom';
   import { motion, AnimatePresence } from 'framer-motion';
   import styled, { ThemeProvider } from 'styled-components';
   import '../App.css';

   interface User {
     id: string;
     firstname: string;
     lastname: string;
     email: string;
     password: string;
   }

   interface Task {
     id: string;
     userID: string;
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

   const TaskList: React.FC = () => {
     const [tasks, setTasks] = useState<Task[]>([]);
     const [title, setTitle] = useState<string>('');
     const [dueDate, setDueDate] = useState<string>('');
     const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
     const [editingId, setEditingId] = useState<string | null>(null);
     const [theme, setTheme] = useState<string>('light');
     const [titleError, setTitleError] = useState<string>('');
     const [dueDateError, setDueDateError] = useState<string>('');
     const navigate = useNavigate();
     const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
     const isMounted = useRef(false);

     const fetchTasks = useCallback(async () => {
       if (!user) return;
       try {
         const response = await axios.get<Task[]>(
           `${process.env.REACT_APP_API_URL}/tasks?userID=${encodeURIComponent(user.id)}`
         );
         setTasks(response.data);
       } catch (err) {
         console.error('Error fetching tasks:', err);
       }
     }, [user]);

     useEffect(() => {
       if (!user) {
         navigate('/login');
         return;
       }
       if (!isMounted.current) {
         fetchTasks();
         const savedTheme = localStorage.getItem('theme') || 'light';
         setTheme(savedTheme);
         document.body.setAttribute('data-theme', savedTheme);
         isMounted.current = true;
       }
     }, [navigate, user, fetchTasks]);

     useEffect(() => {
       localStorage.setItem('theme', theme);
       document.body.setAttribute('data-theme', theme);
     }, [theme]);

     const toggleTheme = () => {
       setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
     };

     const addOrUpdateTask = async () => {
       setTitleError('');
       setDueDateError('');
       if (!title) {
         setTitleError('Title is required');
         return;
       }
       if (!dueDate) {
         setDueDateError('Due date is required');
         return;
       }
       if (!user) return;

       try {
         if (editingId) {
           await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${editingId}`, {
             userID: user.id,
             title,
             dueDate,
             priority,
             completed: tasks.find(task => task.id === editingId)?.completed || false,
           });
           setEditingId(null);
         } else {
           await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, {
             userID: user.id,
             title,
             dueDate,
             priority,
             completed: false,
           });
         }
         setTitle('');
         setDueDate('');
         setPriority('Medium');
         fetchTasks();
       } catch (err) {
         console.error('Error saving task:', err);
       }
     };

     const editTask = (task: Task) => {
       setTitle(task.title);
       setDueDate(task.dueDate);
       setPriority(task.priority);
       setEditingId(task.id);
     };

     const deleteTask = async (id: string) => {
       try {
         await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`);
         fetchTasks();
       } catch (err) {
         console.error('Error deleting task:', err);
       }
     };

     const toggleCompleted = async (id: string) => {
       const task = tasks.find(task => task.id === id);
       if (!task) return;
       try {
         await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
           ...task,
           completed: !task.completed,
         });
         fetchTasks();
       } catch (err) {
         console.error('Error updating task:', err);
       }
     };

     return (
       <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
         <div className="app">
           <ThemeToggle onClick={toggleTheme}>
             {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
           </ThemeToggle>
           <h1>Task Tracker for {user?.firstname}</h1>
           <div className="form">
             <div>
               <input
                 type="text"
                 placeholder="Task Title"
                 value={title}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
               />
               {titleError && <span className="error">{titleError}</span>}
             </div>
             <div>
               <input
                 type="date"
                 value={dueDate}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
               />
               {dueDateError && <span className="error">{dueDateError}</span>}
             </div>
             <select
               value={priority}
               onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                 setPriority(e.target.value as 'Low' | 'Medium' | 'High')
               }
             >
               <option>Low</option>
               <option>Medium</option>
               <option>High</option>
             </select>
             <button disabled={!title || !dueDate} onClick={addOrUpdateTask}>
               {editingId ? 'Update' : 'Add'} Task
             </button>
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
                   <input
                     type="checkbox"
                     checked={task.completed}
                     onChange={() => toggleCompleted(task.id)}
                   />
                   <span>
                     {task.title} - Due: {task.dueDate} - Priority: {task.priority}
                   </span>
                   <div className="button-group">
                     <button onClick={() => editTask(task)}>Edit</button>
                     <button onClick={() => deleteTask(task.id)}>Delete</button>
                   </div>
                 </motion.li>
               ))}
             </AnimatePresence>
           </ul>
           <button
             onClick={() => {
               localStorage.removeItem('user');
               navigate('/login');
             }}
           >
             Logout
           </button>
         </div>
       </ThemeProvider>
     );
   };

   export default TaskList;