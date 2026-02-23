// src/components/EditInvoice.js
import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Row,
  Col,
  Button,
  Form,
  Card,
  InputGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import { BiSave, BiArrowBack } from 'react-icons/bi';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import { invoiceAPI } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

function EditInvoice() {
  const navigate = useNavigate();
  const { id: invoiceId } = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState('₹');
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [billTo, setBillTo] = useState('');
  const [billToEmail, setBillToEmail] = useState('');
  const [billToAddress, setBillToAddress] = useState('');
  const [billFrom, setBillFrom] = useState('');
  const [billFromEmail, setBillFromEmail] = useState('');
  const [billFromAddress, setBillFromAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [total, setTotal] = useState('0.00');
  const [subTotal, setSubTotal] = useState('0.00');
  const [sgstRate, setSgstRate] = useState('');
  const [sgstAmount, setSgstAmount] = useState('0.00');
  const [cgstRate, setCgstRate] = useState('');
  const [cgstAmount, setCgstAmount] = useState('0.00');
  const [discountRate, setDiscountRate] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [logoUrl, setLogoUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState([
    { id: 0, name: '', description: '', price: '1.00', quantity: 1 }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load invoice on mount
  useEffect(() => {
    let mounted = true;
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await invoiceAPI.getById(invoiceId);
        const invoice = response.data;

        if (!mounted) return;

        setInvoiceNumber(invoice.invoiceNumber ?? 1);
        setBillTo(invoice.billTo ?? '');
        setBillToEmail(invoice.billToEmail ?? '');
        setBillToAddress(invoice.billToAddress ?? '');
        setBillFrom(invoice.billFrom ?? '');
        setBillFromEmail(invoice.billFromEmail ?? '');
        setBillFromAddress(invoice.billFromAddress ?? '');
        setDateOfIssue(invoice.dateOfIssue ?? '');
        setNotes(invoice.notes ?? '');
        setItems(invoice.items?.length ? invoice.items : [{ id: 0, name: '', description: '', price: '1.00', quantity: 1 }]);
        setSubTotal(invoice.subTotal ?? '0.00');
        setSgstRate(invoice.sgstRate ?? '');
        setSgstAmount(invoice.sgstAmount ?? '0.00');
        setCgstRate(invoice.cgstRate ?? '');
        setCgstAmount(invoice.cgstAmount ?? '0.00');
        setDiscountRate(invoice.discountRate ?? '');
        setDiscountAmount(invoice.discountAmount ?? '0.00');
        setTotal(invoice.total ?? '0.00');
        setCurrency(invoice.currency ?? '₹');
        setLogoUrl(invoice.logoUrl ?? '');
        setStatus(invoice.status ?? 'draft');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load invoice');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInvoice();
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  // Calculation logic (kept as a useCallback to avoid recreating on every render)
  const calculateTotals = useCallback(() => {
    // Ensure numeric values
    const safeNumber = (v) => {
      if (v === '' || v === null || v === undefined) return 0;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    const rawSubTotal = items.reduce((acc, it) => {
      const price = safeNumber(it.price);
      const qty = safeNumber(it.quantity);
      return acc + price * qty;
    }, 0);

    const newSubTotal = Number(rawSubTotal).toFixed(2);

    const sgstAmt = ((rawSubTotal * safeNumber(sgstRate)) / 100);
    const cgstAmt = ((rawSubTotal * safeNumber(cgstRate)) / 100);
    const discountAmt = ((rawSubTotal * safeNumber(discountRate)) / 100);

    const rawTotal = rawSubTotal - discountAmt + sgstAmt + cgstAmt;

    setSubTotal(Number(newSubTotal).toFixed(2));
    setSgstAmount(Number(sgstAmt).toFixed(2));
    setCgstAmount(Number(cgstAmt).toFixed(2));
    setDiscountAmount(Number(discountAmt).toFixed(2));
    setTotal(Number(rawTotal).toFixed(2));
  }, [items, sgstRate, cgstRate, discountRate]);

  // Recalculate when dependent values change
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Item handlers
  const handleRowDel = (itemToDelete) => {
    const updated = items.filter((i) => i.id !== itemToDelete.id);
    setItems(updated);
  };

  const handleAddEvent = () => {
    const id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newItem = { id, name: '', description: '', price: '1.00', quantity: 1 };
    setItems((prev) => [...prev, newItem]);
  };

  const onItemizedItemEdit = (evt) => {
    const { id, name, value } = evt.target;
    setItems((prevItems) =>
      prevItems.map((it) => {
        if (it.id === id && Object.prototype.hasOwnProperty.call(it, name)) {
          // preserve data types for numeric fields
          const newVal = name === 'quantity' ? (value === '' ? '' : Number(value)) : value;
          return { ...it, [name]: newVal };
        }
        return it;
      })
    );
  };

  // Generic field edit
  const editField = (e) => {
    const { name, value } = e.target;
    // route to proper state setter
    switch (name) {
      case 'invoiceNumber':
        setInvoiceNumber(Number(value));
        break;
      case 'dateOfIssue':
        setDateOfIssue(value);
        break;
      case 'billTo':
        setBillTo(value);
        break;
      case 'billToEmail':
        setBillToEmail(value);
        break;
      case 'billToAddress':
        setBillToAddress(value);
        break;
      case 'billFrom':
        setBillFrom(value);
        break;
      case 'billFromEmail':
        setBillFromEmail(value);
        break;
      case 'billFromAddress':
        setBillFromAddress(value);
        break;
      case 'notes':
        setNotes(value);
        break;
      case 'sgstRate':
        setSgstRate(value);
        break;
      case 'cgstRate':
        setCgstRate(value);
        break;
      case 'discountRate':
        setDiscountRate(value);
        break;
      case 'logoUrl':
        setLogoUrl(value);
        break;
      default:
        break;
    }
  };

  const onCurrencyChange = ({ currency: newCurrency }) => {
    setCurrency(newCurrency);
  };

  // Modal controls
  const openModal = (e) => {
    e.preventDefault();
    calculateTotals();
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Update invoice
  const handleUpdateInvoice = async () => {
    try {
      setSaving(true);
      setError(null);

      const invoiceData = {
        invoiceNumber,
        billTo,
        billToEmail,
        billToAddress,
        billFrom,
        billFromEmail,
        billFromAddress,
        dateOfIssue,
        notes,
        items,
        subTotal,
        sgstRate,
        sgstAmount,
        cgstRate,
        cgstAmount,
        discountRate,
        discountAmount,
        total,
        currency,
        logoUrl,
        status
      };

      await invoiceAPI.update(invoiceId, invoiceData);

      setSuccess('Invoice updated successfully!');
      setSaving(false);

      // Navigate back after short feedback (keeps user experience close to your previous flow)
      setTimeout(() => {
        navigate('/invoices');
      }, 1400);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update invoice');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="mb-4">
          <Button variant="outline-secondary" onClick={() => navigate('/invoices')} className="mb-3">
            <BiArrowBack className="me-2" />
            Back to Invoices
          </Button>
          <h2 className="fw-bold">Edit Invoice #{invoiceNumber}</h2>
        </div>

        <Form onSubmit={openModal}>
          <Row>
            <Col md={8} lg={9}>
              <Card className="p-4 p-xl-5 my-3 my-xl-4 shadow-sm border-0">
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {success && <Alert variant="success" className="mb-3">{success}</Alert>}

                <div className="d-flex flex-row align-items-start justify-content-between mb-3">
                  <div className="d-flex flex-column">
                    <div className="mb-2">
                      <span className="fw-bold">Current&nbsp;Date:&nbsp;</span>
                      <span className="current-date">{currentDate}</span>
                    </div>
                    <div className="d-flex flex-row align-items-center">
                      <span className="fw-bold d-block me-2">Due&nbsp;Date:</span>
                      <Form.Control
                        type="date"
                        value={dateOfIssue}
                        name="dateOfIssue"
                        onChange={editField}
                        style={{ maxWidth: '150px' }}
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center">
                    <span className="fw-bold me-2">Invoice&nbsp;Number:&nbsp;</span>
                    <Form.Control
                      type="number"
                      value={invoiceNumber}
                      name="invoiceNumber"
                      onChange={editField}
                      min="1"
                      style={{ maxWidth: '70px' }}
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <Row className="mb-5">
                  <Col>
                    <Form.Label className="fw-bold">Bill to:</Form.Label>
                    <Form.Control placeholder="Who is this invoice to?" rows={3} value={billTo} type="text" name="billTo" className="my-2" onChange={editField} autoComplete="name" required />
                    <Form.Control placeholder="Email address" value={billToEmail} type="email" name="billToEmail" className="my-2" onChange={editField} autoComplete="email" required />
                    <Form.Control placeholder="Billing address" value={billToAddress} type="text" name="billToAddress" className="my-2" autoComplete="address" onChange={editField} required />
                  </Col>
                  <Col>
                    <Form.Label className="fw-bold">Bill from:</Form.Label>
                    <Form.Control placeholder="Who is this invoice from?" rows={3} value={billFrom} type="text" name="billFrom" className="my-2" onChange={editField} autoComplete="name" required />
                    <Form.Control placeholder="Email address" value={billFromEmail} type="email" name="billFromEmail" className="my-2" onChange={editField} autoComplete="email" required />
                    <Form.Control placeholder="Billing address" value={billFromAddress} type="text" name="billFromAddress" className="my-2" autoComplete="address" onChange={editField} required />
                  </Col>
                </Row>

                <InvoiceItem
                  onItemizedItemEdit={onItemizedItemEdit}
                  onRowAdd={handleAddEvent}
                  onRowDel={handleRowDel}
                  currency={currency}
                  items={items}
                />

                <Row className="mt-4 justify-content-end">
                  <Col lg={6}>
                    <div className="d-flex flex-row align-items-start justify-content-between">
                      <span className="fw-bold">Subtotal:</span>
                      <span>{currency}{subTotal}</span>
                    </div>

                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                      <span className="fw-bold">Discount:</span>
                      <span>
                        <span className="small">({discountRate || 0}%)</span>
                        {currency}{discountAmount || 0}
                      </span>
                    </div>

                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                      <span className="fw-bold">SGST:</span>
                      <span>
                        <span className="small">({sgstRate || 0}%)</span>
                        {currency}{sgstAmount || 0}
                      </span>
                    </div>

                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                      <span className="fw-bold">CGST:</span>
                      <span>
                        <span className="small">({cgstRate || 0}%)</span>
                        {currency}{cgstAmount || 0}
                      </span>
                    </div>

                    <hr />

                    <div className="d-flex flex-row align-items-start justify-content-between" style={{ fontSize: '1.125rem' }}>
                      <span className="fw-bold">Total:</span>
                      <span className="fw-bold">{currency}{total || 0}</span>
                    </div>
                  </Col>
                </Row>

                <hr className="my-4" />

                <Form.Label className="fw-bold">Notes:</Form.Label>
                <Form.Control placeholder="Thanks for your business!" name="notes" value={notes} onChange={editField} as="textarea" className="my-2" rows={1} />
              </Card>
            </Col>

            <Col md={4} lg={3}>
              <div className="sticky-top pt-md-3 pt-xl-4">
                <Button variant="primary" type="submit" className="d-block w-100 mb-2 fw-bold" style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}>
                  Review Invoice
                </Button>

                <Button variant="success" onClick={handleUpdateInvoice} className="d-block w-100 mb-2 fw-bold" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <BiSave className="me-2" />
                      Update Invoice
                    </>
                  )}
                </Button>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Status:</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} className="btn btn-light my-1">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Currency:</Form.Label>
                  <Form.Select
                    value={currency}
                    onChange={(e) => onCurrencyChange({ currency: e.target.value })}
                    className="btn btn-light my-1"
                    aria-label="Change Currency"
                  >
                    <option value="₹">INR (Indian Rupee)</option>
                    <option value="$">USD (United States Dollar)</option>
                    <option value="£">GBP (British Pound Sterling)</option>
                    <option value="¥">JPY (Japanese Yen)</option>
                    <option value="$">CAD (Canadian Dollar)</option>
                    <option value="$">AUD (Australian Dollar)</option>
                    <option value="$">SGD (Singapore Dollar)</option>
                    <option value="¥">CNY (Chinese Renminbi)</option>
                    <option value="₿">BTC (Bitcoin)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="my-3">
                  <Form.Label className="fw-bold">SGST rate:</Form.Label>
                  <InputGroup className="my-1 flex-nowrap">
                    <Form.Control
                      name="sgstRate"
                      type="number"
                      value={sgstRate}
                      onChange={editField}
                      className="bg-white border"
                      placeholder="0.0"
                      min="0.00"
                      step="0.01"
                      max="100.00"
                    />
                    <InputGroup.Text className="bg-light fw-bold text-secondary small">%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="my-3">
                  <Form.Label className="fw-bold">CGST rate:</Form.Label>
                  <InputGroup className="my-1 flex-nowrap">
                    <Form.Control
                      name="cgstRate"
                      type="number"
                      value={cgstRate}
                      onChange={editField}
                      className="bg-white border"
                      placeholder="0.0"
                      min="0.00"
                      step="0.01"
                      max="100.00"
                    />
                    <InputGroup.Text className="bg-light fw-bold text-secondary small">%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="my-3">
                  <Form.Label className="fw-bold">Discount rate:</Form.Label>
                  <InputGroup className="my-1 flex-nowrap">
                    <Form.Control
                      name="discountRate"
                      type="number"
                      value={discountRate}
                      onChange={editField}
                      className="bg-white border"
                      placeholder="0.0"
                      min="0.00"
                      step="0.01"
                      max="100.00"
                    />
                    <InputGroup.Text className="bg-light fw-bold text-secondary small">%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="my-3">
                  <Form.Label className="fw-bold">Logo URL:</Form.Label>
                  <Form.Control
                    name="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={editField}
                    className="bg-white border"
                    placeholder="https://example.com/logo.png"
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>

          <InvoiceModal
            showModal={isOpen}
            closeModal={closeModal}
            info={{
              invoiceNumber,
              billTo,
              billToEmail,
              billToAddress,
              billFrom,
              billFromEmail,
              billFromAddress,
              dateOfIssue,
              notes,
              subTotal,
              sgstRate,
              sgstAmount,
              cgstRate,
              cgstAmount,
              discountRate,
              discountAmount,
              total,
              currency,
              logoUrl,
              status
            }}
            items={items}
            currency={currency}
            subTotal={subTotal}
            sgstRate={sgstRate}
            sgstAmount={sgstAmount}
            cgstRate={cgstRate}
            cgstAmount={cgstAmount}
            discountRate={discountRate}
            discountAmount={discountAmount}
            total={total}
            logoUrl={logoUrl}
            invoiceId={invoiceId}
          />
        </Form>
      </div>
    </div>
  );
}

export default EditInvoice;
