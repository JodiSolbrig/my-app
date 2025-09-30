import React from 'react';
   import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
   import './App.css';
   import Login from './components/Login';
   import TaskList from './components/TaskList';

   interface User {
     id: string;
     firstname: string;
     lastname: string;
     email: string;
     password: string;
   }

   const App: React.FC = () => {
     const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
     console.log('App user check:', user);

     return (
       <Router>
         <Routes>
           <Route path="/login" element={<Login />} />
           <Route
             path="/tasks"
             element={user ? <TaskList /> : <Navigate to="/login" />}
           />
           <Route path="/" element={<Navigate to="/login" />} />
         </Routes>
       </Router>
     );
   };

   export default App;