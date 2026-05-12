import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get('role');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.username, formData.password, role);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);

      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDemoCredentials = {
    doctor: { username: 'doctor1', password: 'password123' },
    patient: { username: 'patient1', password: 'password123' }
  };

  const demoLogin = () => {
    const creds = isDemoCredentials[role];
    setFormData(creds);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>{role === 'doctor' ? 'Doctor Login' : 'Patient Login'}</h1>
          <p>PCOS Health Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-title">Demo Credentials</p>
          <button type="button" className="btn btn-demo" onClick={demoLogin}>
            Use Demo {role === 'doctor' ? 'Doctor' : 'Patient'} Account
          </button>
          {isDemoCredentials[role] && (
            <p className="demo-info">
              Username: {isDemoCredentials[role].username}<br />
              Password: {isDemoCredentials[role].password}
            </p>
          )}
        </div>

        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}