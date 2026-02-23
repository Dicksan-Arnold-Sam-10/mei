import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Login, Register } from './components/Auth';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList_TEMP';
import EditInvoice from './components/EditInvoice';

// Protected Route Component
class ProtectedRoute extends Component {
  render() {
    const token = localStorage.getItem('token');
    const { children } = this.props;
    
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          {/* Auth Routes - Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Invoice Routes - Protected */}
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/invoices/new"
            element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            }
          />
          
         <Route
  path="/invoices/:id"
  element={
    <ProtectedRoute>
      <EditInvoice />
    </ProtectedRoute>
  }
/>


          {/* Default Route */}
          <Route path="/" element={<Navigate to="/invoices" replace />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/invoices" replace />} />
        </Routes>
      </Router>
    );
  }
}

export default App;