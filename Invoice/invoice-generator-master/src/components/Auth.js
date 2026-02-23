import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.token);
      
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '450px' }} className="shadow-lg">
        <Card.Body className="p-5">
          <h3 className="fw-bold mb-4 text-center">Login</h3>
          
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 fw-bold py-2"
              style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
              disabled={loading}
            >
              {loading ? <><Spinner size="sm" className="me-2" /> Logging in...</> : 'Login'}
            </Button>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-muted">Don't have an account? <Link to="/register" className="fw-bold">Register here</Link></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(formData);
      localStorage.setItem('token', response.data.token);
      
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '450px' }} className="shadow-lg">
        <Card.Body className="p-5">
          <h3 className="fw-bold mb-4 text-center">Register</h3>
          
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 fw-bold py-2"
              style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
              disabled={loading}
            >
              {loading ? <><Spinner size="sm" className="me-2" /> Registering...</> : 'Register'}
            </Button>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-muted">Already have an account? <Link to="/login" className="fw-bold">Login here</Link></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}