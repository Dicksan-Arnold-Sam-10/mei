import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Button, Spinner, Card, Row, Col, Badge, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiPlus, BiLogOut, BiSearch, BiFilter, BiCheckCircle, BiXCircle, BiX } from 'react-icons/bi';
import { invoiceAPI } from '../services/api';

// Snackbar Component
const Snackbar = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  const icon = type === 'success' ? <BiCheckCircle size={24} /> : <BiXCircle size={24} />;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: bgColor,
        color: '#ffffff',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 9999,
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
        fontWeight: '600'
      }}
    >
      {icon}
      <span>{message}</span>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ show, onClose, onConfirm, title, message, confirmText, confirmVariant }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Modal.Title className="fw-bold text-white d-flex align-items-center gap-2">
          <BiXCircle size={24} />
          {title}
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onClose}
          className="text-white p-0"
          style={{ fontSize: '1.5rem', textDecoration: 'none', opacity: 0.8 }}
        >
          <BiX />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="mb-0" style={{ fontSize: '1rem', lineHeight: '1.6', color: '#4b5563' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 px-4">
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          className="fw-semibold px-4"
          style={{ borderRadius: '0.5rem', borderWidth: '2px' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          className="fw-bold px-4 border-0"
          style={{ 
            background: confirmVariant === 'danger' 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '0.5rem'
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const showNotification = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const hideSnackbar = () => {
    setShowSnackbar(false);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      setInvoices(response.data);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteInvoiceId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await invoiceAPI.delete(deleteInvoiceId);
      showNotification('Invoice deleted successfully! 🗑️', 'success');
      fetchInvoices();
      setShowDeleteModal(false);
      setDeleteInvoiceId(null);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete invoice', 'error');
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteInvoiceId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showNotification('Logged out successfully! 👋', 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: { bg: '#f59e0b', color: '#ffffff' },
      sent: { bg: '#3b82f6', color: '#ffffff' },
      paid: { bg: '#10b981', color: '#ffffff' }
    };
    const style = variants[status] || { bg: '#6b7280', color: '#ffffff' };
    return (
      <Badge 
        style={{ 
          backgroundColor: style.bg, 
          color: style.color,
          padding: '0.5rem 1rem',
          fontSize: '0.813rem',
          fontWeight: '600',
          textTransform: 'capitalize',
          borderRadius: '0.5rem'
        }}
      >
        {status}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.billTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTotalStats = () => {
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const pending = total - paid;
    return { total, paid, pending };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: '#4f46e5' }} />
          <p className="mt-3 text-muted">Loading invoices...</p>
        </div>
      </Container>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      paddingBottom: '3rem'
    }}>
      <Container fluid className="py-4 px-4" style={{ maxWidth: '1400px' }}>
        {/* Header Section */}
        <div className="mb-4">
          <Row className="align-items-center">
            <Col>
              <h1 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '2rem' }}>
                Invoice Management
              </h1>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                Track and manage all your invoices in one place
              </p>
            </Col>
            <Col xs="auto" className="text-end">
              <Button
                className="me-2 border-0 fw-semibold shadow-sm"
                onClick={() => navigate('/invoices/new')}
                style={{ 
                  background: '#ffffff',
                  color: '#4f46e5',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.75rem',
                  transition: 'all 0.3s'
                }}
              >
                <BiPlus size={20} className="me-2" /> New Invoice
              </Button>
              <Button
                className="border-0 fw-semibold"
                onClick={handleLogout}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <BiLogOut size={18} className="me-2" /> Logout
              </Button>
            </Col>
          </Row>
        </div>

        {/* Snackbar */}
        <Snackbar 
          show={showSnackbar} 
          message={snackbarMessage} 
          type={snackbarType}
          onClose={hideSnackbar}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          show={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Invoice"
          message="Are you sure you want to delete this invoice? This action cannot be undone."
          confirmText="Delete"
          confirmVariant="danger"
        />

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1 fw-medium" style={{ fontSize: '0.875rem' }}>Total Revenue</p>
                    <h3 className="mb-0 fw-bold" style={{ color: '#1f2937' }}>₹{stats.total.toFixed(2)}</h3>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', color: '#ffffff' }}>💰</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1 fw-medium" style={{ fontSize: '0.875rem' }}>Paid</p>
                    <h3 className="mb-0 fw-bold" style={{ color: '#10b981' }}>₹{stats.paid.toFixed(2)}</h3>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', color: '#ffffff' }}>✓</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1 fw-medium" style={{ fontSize: '0.875rem' }}>Pending</p>
                    <h3 className="mb-0 fw-bold" style={{ color: '#f59e0b' }}>₹{stats.pending.toFixed(2)}</h3>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', color: '#ffffff' }}>⏱</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card className="border-0 shadow" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          {/* Search and Filter Bar */}
          <Card.Body className="p-4 border-bottom" style={{ background: '#f9fafb' }}>
            <Row className="g-3">
              <Col md={6}>
                <div className="position-relative">
                  <BiSearch 
                    size={20} 
                    className="position-absolute" 
                    style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <Form.Control
                    type="text"
                    placeholder="Search by invoice number or client name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-sm"
                    style={{ 
                      paddingLeft: '3rem',
                      borderRadius: '0.75rem',
                      height: '3rem'
                    }}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center gap-2">
                  <BiFilter size={20} className="text-muted" />
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-0 shadow-sm fw-medium"
                    style={{ 
                      borderRadius: '0.75rem',
                      height: '3rem'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>
          </Card.Body>

          {/* Invoices Table */}
          <Card.Body className="p-0">
            {filteredInvoices.length === 0 ? (
              <div className="p-5 text-center">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <h5 className="mb-2" style={{ color: '#6b7280' }}>
                  {searchTerm || filterStatus !== 'all' ? 'No invoices match your search' : 'No invoices found'}
                </h5>
                <p className="text-muted mb-4">
                  {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first invoice'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    className="border-0 fw-semibold shadow-sm"
                    onClick={() => navigate('/invoices/new')}
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      padding: '0.75rem 2rem',
                      borderRadius: '0.75rem'
                    }}
                  >
                    <BiPlus size={20} className="me-2" />
                    Create your first invoice
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table className="mb-0" hover responsive>
                  <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>INVOICE</th>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>CLIENT</th>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>DATE</th>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>AMOUNT</th>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>STATUS</th>
                      <th style={{ padding: '1.25rem', fontWeight: '700', color: '#374151', fontSize: '0.875rem' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr 
                        key={invoice.id} 
                        style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'all 0.2s'
                        }}
                      >
                        <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center">
                            <div 
                              style={{ 
                                width: '2.5rem', 
                                height: '2.5rem', 
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#ffffff'
                              }}
                            >
                              #{index + 1}
                            </div>
                            <span className="fw-bold" style={{ color: '#1f2937' }}>
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem', color: '#4b5563', fontWeight: '500', verticalAlign: 'middle' }}>
                          {invoice.billTo}
                        </td>
                        <td style={{ padding: '1.25rem', color: '#6b7280', verticalAlign: 'middle' }}>
                          {new Date(invoice.dateOfIssue).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={{ padding: '1.25rem', fontWeight: '700', color: '#1f2937', fontSize: '1rem', verticalAlign: 'middle' }}>
                          ₹{parseFloat(invoice.total).toFixed(2)}
                        </td>
                        <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              className="border-0 shadow-sm"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                              style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                              }}
                              title="Edit"
                            >
                              <BiEdit size={16} />
                            </Button>
                            <Button
                              size="sm"
                              className="border-0 shadow-sm"
                              onClick={() => handleDeleteClick(invoice.id)}
                              style={{ 
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: '#ffffff',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                              }}
                              title="Delete"
                            >
                              <BiTrash size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default InvoiceList;