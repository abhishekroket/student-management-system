import { useState } from 'react';
import axios from 'axios';

const API_URL = "https://student-management-system-api-1hsh.onrender.com";

function Login({ onLoginSuccess }) {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const getCsrfToken = async () => {
const response = await axios.get(
`${API_URL}/auth/csrf/`,
{ withCredentials: true }
);

return response.data.csrfToken;


};

const handleLogin = async (e) => {
e.preventDefault();
setError('');
setLoading(true);


try {
  const csrfToken = await getCsrfToken();

  const response = await axios.post(
    `${API_URL}/auth/login/`,
    { username, password },
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );

  onLoginSuccess(response.data);
} catch (err) {
  setError(
    err.response?.data?.error ||
    'Login failed. Please check your details and try again.'
  );
} finally {
  setLoading(false);
}


};

return ( <div className="login-container"> <form className="login-form" onSubmit={handleLogin}> <h2>Student Management System</h2> <p>Login to your account</p>


    <label htmlFor="username">Username</label>
    <input
      id="username"
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      autoComplete="username"
      required
    />

    <label htmlFor="password">Password</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="current-password"
      required
    />

    {error && <p className="login-error">{error}</p>}

    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
</div>


);
}

export default Login;
