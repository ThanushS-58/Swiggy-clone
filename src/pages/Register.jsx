import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
          await register(form);
      alert('Account created successfully. Please login.');
      navigate('/login');
    } catch (error) {
          alert(error.message || 'Registration failed.');
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Create account</span>
        <h1>Sign up</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <label>
            Address
            <textarea name="address" value={form.address} onChange={handleChange} rows="3" required />
          </label>

          <button type="submit" className="primary-btn full-width">Create account</button>
        </form>

        <p>
          Already a user? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
