import { useState } from 'react';
   import axios from 'axios';
   import { useNavigate } from 'react-router-dom';

   const Login: React.FC = () => {
     const [email, setEmail] = useState<string>('');
     const [password, setPassword] = useState<string>('');
     const [error, setError] = useState<string>('');
     const [loading, setLoading] = useState<boolean>(false);
     const navigate = useNavigate();


const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);
  console.log('Login attempt:', { email, password, timestamp: new Date().toISOString() });
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  try {
    console.log('API URL:', process.env.REACT_APP_API_URL);
    const url = `${process.env.REACT_APP_API_URL}/users?email=${encodeURIComponent(trimmedEmail)}&password=${encodeURIComponent(trimmedPassword)}`;
    console.log('Query URL:', url);
    const response = await axios.get(url);
    console.log('Response:', response.data);
    if (response.data.length > 0) {
      const user = response.data[0];
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Stored user:', localStorage.getItem('user'));
      navigate('/tasks'); // Direct navigation
      setLoading(false);
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  } catch (err: any) {
    console.error('Login error:', err.message);
    setError(`Login failed: ${err.message}`);
    setLoading(false);
  }
};

     return (
       <div className="login">
         <h2>Login</h2>
         <form onSubmit={handleLogin}>
           <input
             type="email"
             value={email}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
             placeholder="Email"
             required
             disabled={loading}
           />
           <input
             type="password"
             value={password}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
             placeholder="Password"
             required
             disabled={loading}
           />
           <button type="submit" disabled={loading}>
             {loading ? 'Logging in...' : 'Login'}
           </button>
         </form>
         {error && <p>{error}</p>}
       </div>
     );
   };

   export default Login;