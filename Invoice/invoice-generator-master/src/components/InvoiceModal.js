import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { BiPaperPlane, BiCloudDownload } from "react-icons/bi";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';

function GenerateInvoice(invoiceNumber) {
  html2canvas(document.querySelector("#invoiceCapture"), { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [612, 792]
    });
    pdf.internal.scaleFactor = 1;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoiceNumber || new Date().getTime()}.pdf`);
  });
}

class InvoiceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      success: null
    };
  }
  

  handleSendInvoice = async () => {
    const { invoiceId, info } = this.props;
    
    if (!invoiceId) {
      this.setState({ error: 'Please save the invoice first before sending' });
      return;
    }

    try {
      this.setState({ loading: true, error: null });

      // Generate PDF
      const canvas = await html2canvas(document.querySelector("#invoiceCapture"), { scale: 2 });
      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [612, 792]
      });
      
      pdf.internal.scaleFactor = 1;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Convert PDF to base64
      const pdfBase64 = pdf.output('datauristring').split('base64,')[1];

      // Send invoice via API
      const response = await api.post('/invoices/send', {
        invoiceId,
        recipientEmail: info.billToEmail,
        pdfBase64,
        invoiceNumber: info.invoiceNumber
      });

      this.setState({ 
        success: response.data.message,
        loading: false 
      });

      if (this.props.onSendSuccess) {
        this.props.onSendSuccess();
      }

      setTimeout(() => {
        this.setState({ success: null });
      }, 3000);
    } catch (error) {
      this.setState({ 
        error: error.response?.data?.message || 'Failed to send invoice',
        loading: false 
      });
    }
  };

  render() {
    const { loading, error, success } = this.state;

    return(
      <div>
        <Modal show={this.props.showModal} onHide={this.props.closeModal} size="lg" centered>
          <Modal.Header style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }} closeButton>
            <Modal.Title className="fw-bold">Invoice Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}
            
            <div id="invoiceCapture" style={{ background: '#fff', padding: '2rem' }}>
              {/* Header with Logo */}
              <div className="d-flex flex-row justify-content-between align-items-start mb-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center gap-3">
                  {this.props.logoUrl && (
                    <img src={this.props.logoUrl} alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
                  )}
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1f2937' }}>
                      {this.props.info.billFrom || 'Your Company'}
                    </h4>
                    <h6 className="fw-bold text-secondary mb-0">
                      Invoice #: {this.props.info.invoiceNumber || ''}
                    </h6>
                  </div>
                </div>
                <div className="text-end">
                  <h6 className="fw-bold mt-1 mb-2" style={{ color: '#6b7280' }}>Amount Due:</h6>
                  <h4 className="fw-bold" style={{ color: '#4f46e5' }}>
                    {this.props.currency} {this.props.total}
                  </h4>
                </div>
              </div>

              {/* Billing Details */}
              <Row className="mb-5">
                <Col md={3}>
                  <div className="fw-bold mb-3" style={{ color: '#1f2937' }}>Billed to:</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div className="fw-semibold">{this.props.info.billTo || ''}</div>
                    <div className="text-muted">{this.props.info.billToAddress || ''}</div>
                    <div className="text-muted">{this.props.info.billToEmail || ''}</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="fw-bold mb-3" style={{ color: '#1f2937' }}>Billed From:</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div className="fw-semibold">{this.props.info.billFrom || ''}</div>
                    <div className="text-muted">{this.props.info.billFromAddress || ''}</div>
                    <div className="text-muted">{this.props.info.billFromEmail || ''}</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="fw-bold mb-3" style={{ color: '#1f2937' }}>Date Of Issue:</div>
                  <div style={{ fontSize: '0.9rem' }} className="text-muted">{this.props.info.dateOfIssue || ''}</div>
                </Col>
                <Col md={3}>
                  <div className="fw-bold mb-3" style={{ color: '#1f2937' }}>Current Date:</div>
                  <div style={{ fontSize: '0.9rem' }} className="text-muted">{new Date().toLocaleDateString()}</div>
                </Col>
              </Row>

              {/* Items Table */}
              <Table className="mb-4" style={{ fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '0.75rem', color: '#374151', fontWeight: 'bold' }}>QTY</th>
                    <th style={{ padding: '0.75rem', color: '#374151', fontWeight: 'bold' }}>DESCRIPTION</th>
                    <th className="text-end" style={{ padding: '0.75rem', color: '#374151', fontWeight: 'bold' }}>PRICE</th>
                    <th className="text-end" style={{ padding: '0.75rem', color: '#374151', fontWeight: 'bold' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.items.map((item, i) => {
                    if (item.name || item.description) {
                      return (
                        <tr id={i} key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem', width: '70px' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div className="fw-semibold">{item.name}</div>
                            <div className="text-muted small">{item.description}</div>
                          </td>
                          <td className="text-end" style={{ padding: '0.75rem', width: '100px' }}>
                            {this.props.currency} {parseFloat(item.price).toFixed(2)}
                          </td>
                          <td className="text-end" style={{ padding: '0.75rem', width: '100px', fontWeight: 'bold' }}>
                            {this.props.currency} {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </Table>

              {/* Totals Section */}
              <div className="row mb-4">
                <div className="col-md-4"></div>
                <div className="col-md-8">
                  <div className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.95rem' }}>
                    <span className="text-muted">SUBTOTAL</span>
                    <span className="fw-semibold">{this.props.currency} {this.props.subTotal}</span>
                  </div>
                  
                  {this.props.discountAmount > 0 &&
                    <div className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.95rem' }}>
                      <span className="text-muted">DISCOUNT ({this.props.discountRate}%)</span>
                      <span className="fw-semibold">-{this.props.currency} {this.props.discountAmount}</span>
                    </div>
                  }
                  
                  <div className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.95rem' }}>
                    <span className="text-muted">SGST ({this.props.sgstRate}%)</span>
                    <span className="fw-semibold">{this.props.currency} {this.props.sgstAmount}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <span className="text-muted">CGST ({this.props.cgstRate}%)</span>
                    <span className="fw-semibold">{this.props.currency} {this.props.cgstAmount}</span>
                  </div>

                  <div className="d-flex justify-content-between p-3 rounded" style={{ background: '#eef2ff', fontSize: '1.1rem', fontWeight: 'bold', color: '#4f46e5' }}>
                    <span>TOTAL</span>
                    <span>{this.props.currency} {this.props.total}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {this.props.info.notes &&
                <div className="p-3 rounded mb-4" style={{ background: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
                  <div className="fw-bold mb-2" style={{ color: '#1e40af' }}>Notes:</div>
                  <div style={{ color: '#1e3a8a', fontSize: '0.95rem' }}>{this.props.info.notes}</div>
                </div>
              }
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: '#f8fafc', borderTop: '2px solid #e5e7eb', gap: '0.75rem' }}>
            <Button variant="outline-secondary" onClick={this.props.closeModal} className="fw-bold rounded-2">
              Close
            </Button>
            <Button 
              className="fw-bold rounded-2 d-flex align-items-center gap-2" 
              onClick={() => GenerateInvoice(this.props.info.invoiceNumber)}
              style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
            >
              <BiCloudDownload style={{width: '18px', height: '18px'}}/>
              Download PDF
            </Button>
            <Button 
              className="fw-bold rounded-2 d-flex align-items-center gap-2" 
              variant="success"
              onClick={this.handleSendInvoice}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" className="me-2" /> : <BiPaperPlane style={{width: '18px', height: '18px'}}/>}
              {loading ? 'Sending...' : 'Send Invoice'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default InvoiceModal;