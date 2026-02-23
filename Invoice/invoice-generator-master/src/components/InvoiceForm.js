import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import InputGroup from 'react-bootstrap/InputGroup';
import { invoiceAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BiArrowBack, BiSave, BiShow, BiCheckCircle, BiXCircle } from 'react-icons/bi';

// Snackbar Component
const Snackbar = ({ show, message, type, onClose }) => {
  React.useEffect(() => {
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

class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      currency: '₹',
      currentDate: '',
      invoiceNumber: 1001,
      dateOfIssue: new Date().toISOString().split('T')[0],
      status: 'draft',
      billTo: '',
      billToEmail: '',
      billToAddress: '',
      billFrom: '',
      billFromEmail: '',
      billFromAddress: '',
      notes: '',
      total: '0.00',
      subTotal: '0.00',
      sgstRate: '9',
      cgstRate: '9',
      sgstAmount: '0.00',
      cgstAmount: '0.00',
      discountRate: '',
      discountAmount: '0.00',
      logoUrl: '',
      items: [
        {
          id: 0,
          name: '',
          description: '',
          price: '0.00',
          quantity: 1
        }
      ],
      loading: false,
      error: null,
      success: null,
      invoiceId: null,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarType: 'success'
    };
    this.editField = this.editField.bind(this);
  }

  componentDidMount() {
    this.handleCalculateTotal();
  }

  showSnackbar = (message, type = 'success') => {
    this.setState({
      showSnackbar: true,
      snackbarMessage: message,
      snackbarType: type
    });
  };

  hideSnackbar = () => {
    this.setState({ showSnackbar: false });
  };

  handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.setState({ logoUrl: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  handleRowDel(items) {
    var index = this.state.items.indexOf(items);
    this.state.items.splice(index, 1);
    this.setState(this.state.items);
    this.handleCalculateTotal();
  }

  handleAddEvent(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var items = {
      id: id,
      name: '',
      price: '0.00',
      description: '',
      quantity: 1
    };
    this.state.items.push(items);
    this.setState(this.state.items);
    this.handleCalculateTotal();
  }

  handleCalculateTotal() {
    var items = this.state.items;
    var subTotal = 0;

    // FIX: Calculate subtotal correctly by adding all items
    items.forEach(function(item) {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQty = parseInt(item.quantity) || 0;
      subTotal = subTotal + (itemPrice * itemQty);
    });

    this.setState({
      subTotal: parseFloat(subTotal).toFixed(2)
    }, () => {
      const discountAmount = parseFloat(parseFloat(this.state.subTotal) * (this.state.discountRate / 100)).toFixed(2);
      const afterDiscount = parseFloat(this.state.subTotal) - parseFloat(discountAmount);
      
      this.setState({
        discountAmount: discountAmount || 0
      }, () => {
        this.setState({
          sgstAmount: parseFloat(parseFloat(afterDiscount) * (this.state.sgstRate / 100)).toFixed(2)
        }, () => {
          this.setState({
            cgstAmount: parseFloat(parseFloat(afterDiscount) * (this.state.cgstRate / 100)).toFixed(2)
          }, () => {
            this.setState({
              total: (parseFloat(afterDiscount) + parseFloat(this.state.sgstAmount) + parseFloat(this.state.cgstAmount)).toFixed(2)
            });
          });
        });
      });
    });
  }

  onItemizedItemEdit(evt) {
    var item = {
      id: evt.target.id,
      name: evt.target.name,
      value: evt.target.value
    };
    var items = this.state.items.slice();
    var newItems = items.map(function(existingItem) {
      // Compare the item id strictly
      if (existingItem.id === item.id) {
        existingItem[item.name] = item.value;
      }
      return existingItem;
    });
    this.setState({items: newItems}, () => {
      // FIX: Always recalculate after item edit
      this.handleCalculateTotal();
    });
  }

  editField = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    }, () => {
      this.handleCalculateTotal();
    });
  };

  openModal = (event) => {
    event.preventDefault();
    this.handleCalculateTotal();
    this.setState({isOpen: true});
  };

  closeModal = (event) => this.setState({isOpen: false});

  resetForm = () => {
    this.setState({
      isOpen: false,
      currency: '₹',
      invoiceNumber: 1001,
      dateOfIssue: new Date().toISOString().split('T')[0],
      status: 'draft',
      billTo: '',
      billToEmail: '',
      billToAddress: '',
      billFrom: '',
      billFromEmail: '',
      billFromAddress: '',
      notes: '',
      total: '0.00',
      subTotal: '0.00',
      sgstRate: '9',
      cgstRate: '9',
      sgstAmount: '0.00',
      cgstAmount: '0.00',
      discountRate: '',
      discountAmount: '0.00',
      logoUrl: '',
      items: [
        {
          id: 0,
          name: '',
          description: '',
          price: '0.00',
          quantity: 1
        }
      ],
      error: null,
      success: null,
      invoiceId: null,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarType: 'success'
    }, () => {
      this.handleCalculateTotal();
    });
  };

  saveInvoice = async () => {
    try {
      this.setState({ loading: true, error: null });

      const invoiceData = {
        invoiceNumber: this.state.invoiceNumber,
        dateOfIssue: this.state.dateOfIssue,
        status: this.state.status,
        billTo: this.state.billTo,
        billToEmail: this.state.billToEmail,
        billToAddress: this.state.billToAddress,
        billFrom: this.state.billFrom,
        billFromEmail: this.state.billFromEmail,
        billFromAddress: this.state.billFromAddress,
        notes: this.state.notes,
        items: this.state.items,
        subTotal: this.state.subTotal,
        sgstRate: this.state.sgstRate,
        cgstRate: this.state.cgstRate,
        sgstAmount: this.state.sgstAmount,
        cgstAmount: this.state.cgstAmount,
        discountRate: this.state.discountRate,
        discountAmount: this.state.discountAmount,
        total: this.state.total,
        logoUrl: this.state.logoUrl
      };

      const response = await invoiceAPI.create(invoiceData);

      this.setState({ 
        invoiceId: response.data.invoice?.id || response.data.id,
        loading: false 
      });

      this.showSnackbar('Invoice saved successfully! 🎉', 'success');

      setTimeout(() => {
        this.resetForm();
        this.props.navigate('/invoices');
      }, 1500);

    } catch (error) {
      this.setState({ loading: false });
      this.showSnackbar(error.response?.data?.message || 'Failed to save invoice', 'error');
    }
  };

  render() {
    const { loading, showSnackbar, snackbarMessage, snackbarType } = this.state;

    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh', 
        padding: '2rem 0' 
      }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          {/* Header */}
          <div className="mb-4">
            <Row className="align-items-center">
              <Col>
                <Button
                  variant="link"
                  className="text-white text-decoration-none p-0 mb-2"
                  onClick={() => this.props.navigate('/invoices')}
                  style={{ fontSize: '0.95rem' }}
                >
                  <BiArrowBack size={20} className="me-2" />
                  Back to Invoices
                </Button>
                <h1 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '2rem' }}>
                  Create New Invoice
                </h1>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                  Fill in the details below to generate your invoice
                </p>
              </Col>
            </Row>
          </div>

          {/* Snackbar */}
          <Snackbar 
            show={showSnackbar} 
            message={snackbarMessage} 
            type={snackbarType}
            onClose={this.hideSnackbar}
          />
        
          <Form onSubmit={this.openModal}>
            <Row className="g-4">
              <Col md={8} lg={9}>
                {/* Basic Details Card */}
                <Card className="p-4 p-xl-5 mb-4 shadow border-0" style={{ borderRadius: '1rem' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📋</span>
                    </div>
                    <h5 className="fw-bold mb-0">Invoice Details</h5>
                  </div>
                  
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Label className="fw-semibold small text-muted">Invoice Number</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={this.state.invoiceNumber} 
                        name="invoiceNumber" 
                        onChange={(event) => this.editField(event)}
                        className="border-2"
                        style={{ borderRadius: '0.5rem', height: '3rem' }}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold small text-muted">Date of Issue</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={this.state.dateOfIssue} 
                        name="dateOfIssue" 
                        onChange={(event) => this.editField(event)}
                        className="border-2"
                        style={{ borderRadius: '0.5rem', height: '3rem' }}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold small text-muted">Status</Form.Label>
                      <Form.Select 
                        value={this.state.status} 
                        name="status" 
                        onChange={(event) => this.editField(event)}
                        className="border-2 fw-semibold"
                        style={{ borderRadius: '0.5rem', height: '3rem' }}
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                      </Form.Select>
                    </Col>
                  </Row>
                  
                  <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem' }}>
                    <Form.Label className="fw-semibold small text-muted mb-3">Company Logo</Form.Label>
                    <div className="d-flex align-items-center gap-3">
                      <Form.Control 
                        type="file" 
                        accept="image/*" 
                        onChange={this.handleLogoUpload}
                        className="border-2"
                        style={{ borderRadius: '0.5rem' }}
                      />
                      {this.state.logoUrl && (
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#ffffff', 
                          borderRadius: '0.5rem',
                          border: '2px solid #e5e7eb'
                        }}>
                          <img 
                            src={this.state.logoUrl} 
                            alt="Logo" 
                            style={{ height: '50px', width: '50px', objectFit: 'contain' }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Billing Information Card */}
                <Card className="p-4 p-xl-5 mb-4 shadow border-0" style={{ borderRadius: '1rem' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>👥</span>
                    </div>
                    <h5 className="fw-bold mb-0">Billing Information</h5>
                  </div>
                  
                  <Row className="g-4">
                    <Col md={6}>
                      <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '0.75rem', height: '100%' }}>
                        <Form.Label className="fw-bold mb-3" style={{ color: '#059669' }}>Bill To:</Form.Label>
                        <Form.Control 
                          placeholder="Client name" 
                          value={this.state.billTo} 
                          type="text" 
                          name="billTo" 
                          className="mb-3 border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                        <Form.Control 
                          placeholder="client@email.com" 
                          value={this.state.billToEmail} 
                          type="email" 
                          name="billToEmail" 
                          className="mb-3 border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                        <Form.Control 
                          placeholder="Client billing address" 
                          value={this.state.billToAddress} 
                          type="text" 
                          name="billToAddress" 
                          className="border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '0.75rem', height: '100%' }}>
                        <Form.Label className="fw-bold mb-3" style={{ color: '#2563eb' }}>Bill From:</Form.Label>
                        <Form.Control 
                          placeholder="Your company name" 
                          value={this.state.billFrom} 
                          type="text" 
                          name="billFrom" 
                          className="mb-3 border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                        <Form.Control 
                          placeholder="your@email.com" 
                          value={this.state.billFromEmail} 
                          type="email" 
                          name="billFromEmail" 
                          className="mb-3 border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                        <Form.Control 
                          placeholder="Your company address" 
                          value={this.state.billFromAddress} 
                          type="text" 
                          name="billFromAddress" 
                          className="border-2" 
                          style={{ borderRadius: '0.5rem' }}
                          onChange={(event) => this.editField(event)} 
                          required
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Line Items Card */}
                <Card className="p-4 p-xl-5 mb-4 shadow border-0" style={{ borderRadius: '1rem' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📦</span>
                    </div>
                    <h5 className="fw-bold mb-0">Line Items</h5>
                  </div>
                  <InvoiceItem 
                    onItemizedItemEdit={this.onItemizedItemEdit.bind(this)} 
                    onRowAdd={this.handleAddEvent.bind(this)} 
                    onRowDel={this.handleRowDel.bind(this)} 
                    currency={this.state.currency} 
                    items={this.state.items}
                  />
                </Card>

                {/* Totals Summary Card */}
                <Card className="p-4 p-xl-5 mb-4 shadow border-0" style={{ borderRadius: '1rem' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💵</span>
                    </div>
                    <h5 className="fw-bold mb-0">Summary</h5>
                  </div>
                  
                  <Row className="justify-content-end">
                    <Col lg={7}>
                      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                          <span className="fw-semibold text-muted">Subtotal:</span>
                          <span className="fw-bold fs-5">{this.state.currency}{this.state.subTotal}</span>
                        </div>
                        {parseFloat(this.state.discountAmount) > 0 && (
                          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                            <span className="fw-semibold text-danger">Discount ({this.state.discountRate}%):</span>
                            <span className="fw-bold text-danger">-{this.state.currency}{this.state.discountAmount}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold text-muted">SGST ({this.state.sgstRate}%):</span>
                          <span className="fw-semibold">{this.state.currency}{this.state.sgstAmount}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                          <span className="fw-semibold text-muted">CGST ({this.state.cgstRate}%):</span>
                          <span className="fw-semibold">{this.state.currency}{this.state.cgstAmount}</span>
                        </div>
                        <div 
                          className="d-flex justify-content-between align-items-center p-3" 
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '0.75rem'
                          }}
                        >
                          <span className="fw-bold fs-5 text-white">Total Amount:</span>
                          <span className="fw-bold fs-4 text-white">{this.state.currency}{this.state.total}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Notes Card */}
                <Card className="p-4 p-xl-5 mb-4 shadow border-0" style={{ borderRadius: '1rem' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📝</span>
                    </div>
                    <h5 className="fw-bold mb-0">Additional Notes</h5>
                  </div>
                  <Form.Control 
                    placeholder="Add any additional notes or terms & conditions here..." 
                    name="notes" 
                    value={this.state.notes} 
                    onChange={(event) => this.editField(event)} 
                    as="textarea" 
                    className="border-2" 
                    style={{ borderRadius: '0.75rem', minHeight: '120px' }}
                    rows={4}
                  />
                </Card>
              </Col>

              {/* Sidebar */}
              <Col md={4} lg={3}>
                <div className="sticky-top" style={{ top: '2rem' }}>
                  {/* Tax Settings Card */}
                  <Card className="p-4 shadow-lg mb-3 border-0" style={{ borderRadius: '1rem' }}>
                    <div className="text-center mb-4">
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                      }}>
                        <span style={{ fontSize: '2rem' }}>⚙️</span>
                      </div>
                      <h6 className="fw-bold mb-0">Tax & Discount</h6>
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-muted">SGST Rate (%):</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          name="sgstRate" 
                          type="number" 
                          value={this.state.sgstRate} 
                          onChange={(event) => this.editField(event)} 
                          className="bg-white border-2" 
                          style={{ borderRadius: '0.5rem 0 0 0.5rem', height: '3rem' }}
                          placeholder="0.0" 
                          min="0.00" 
                          step="0.01" 
                          max="100.00"
                        />
                        <InputGroup.Text 
                          className="bg-light fw-bold" 
                          style={{ borderRadius: '0 0.5rem 0.5rem 0', border: '2px solid #dee2e6', borderLeft: 'none' }}
                        >
                          %
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-muted">CGST Rate (%):</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          name="cgstRate" 
                          type="number" 
                          value={this.state.cgstRate} 
                          onChange={(event) => this.editField(event)} 
                          className="bg-white border-2" 
                          style={{ borderRadius: '0.5rem 0 0 0.5rem', height: '3rem' }}
                          placeholder="0.0" 
                          min="0.00" 
                          step="0.01" 
                          max="100.00"
                        />
                        <InputGroup.Text 
                          className="bg-light fw-bold" 
                          style={{ borderRadius: '0 0.5rem 0.5rem 0', border: '2px solid #dee2e6', borderLeft: 'none' }}
                        >
                          %
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold small text-muted">Discount Rate (%):</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          name="discountRate" 
                          type="number" 
                          value={this.state.discountRate} 
                          onChange={(event) => this.editField(event)} 
                          className="bg-white border-2" 
                          style={{ borderRadius: '0.5rem 0 0 0.5rem', height: '3rem' }}
                          placeholder="0.0" 
                          min="0.00" 
                          step="0.01" 
                          max="100.00"
                        />
                        <InputGroup.Text 
                          className="bg-light fw-bold" 
                          style={{ borderRadius: '0 0.5rem 0.5rem 0', border: '2px solid #dee2e6', borderLeft: 'none' }}
                        >
                          %
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.75rem' }}>
                      <div className="d-flex justify-content-between mb-2 small">
                        <span className="text-muted">Subtotal:</span>
                        <strong>{this.state.currency}{this.state.subTotal}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2 small">
                        <span className="text-muted">SGST:</span>
                        <strong className="text-success">{this.state.currency}{this.state.sgstAmount}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-3 small pb-3 border-bottom">
                        <span className="text-muted">CGST:</span>
                        <strong className="text-success">{this.state.currency}{this.state.cgstAmount}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Total:</span>
                        <span className="fw-bold fs-5" style={{ color: '#667eea' }}>{this.state.currency}{this.state.total}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Save Button */}
                  <Card className="p-3 shadow border-0 mb-3" style={{ borderRadius: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <Button 
                      onClick={this.saveInvoice}
                      disabled={loading}
                      className="d-block w-100 fw-bold py-3 border-0" 
                      style={{ 
                        background: '#ffffff',
                        color: '#059669',
                        borderRadius: '0.75rem',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" /> 
                          Saving...
                        </>
                      ) : (
                        <>
                          <BiSave size={20} className="me-2" />
                          Save Invoice
                        </>
                      )}
                    </Button>
                  </Card>

                  {/* Preview Button */}
                  <Card className="p-3 shadow border-0" style={{ borderRadius: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="d-block w-100 fw-bold py-3 border-0" 
                      style={{ 
                        background: '#ffffff',
                        color: '#667eea',
                        borderRadius: '0.75rem',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" /> 
                          Loading...
                        </>
                      ) : (
                        <>
                          <BiShow size={20} className="me-2" />
                          Preview & Download
                        </>
                      )}
                    </Button>
                  </Card>
                </div>
              </Col>
            </Row>
          </Form>

          <InvoiceModal 
            showModal={this.state.isOpen} 
            closeModal={this.closeModal} 
            info={this.state} 
            items={this.state.items} 
            currency={this.state.currency} 
            subTotal={this.state.subTotal} 
            sgstAmount={this.state.sgstAmount} 
            cgstAmount={this.state.cgstAmount} 
            discountAmount={this.state.discountAmount} 
            total={this.state.total} 
            logoUrl={this.state.logoUrl} 
            sgstRate={this.state.sgstRate} 
            cgstRate={this.state.cgstRate} 
            discountRate={this.state.discountRate}
            invoiceId={this.state.invoiceId}
            onSendSuccess={() => this.showSnackbar('Invoice sent successfully! 📧', 'success')}
          />
        </div>
      </div>
    );
  }
}

// Wrapper to use with React Router
function InvoiceFormWrapper(props) {
  const navigate = useNavigate();
  return <InvoiceForm {...props} navigate={navigate} />;
}

export default InvoiceFormWrapper;