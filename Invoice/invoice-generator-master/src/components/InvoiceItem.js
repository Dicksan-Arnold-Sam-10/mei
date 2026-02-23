import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import EditableField from './EditableField';

class InvoiceItem extends React.Component {
  render() {
    var onItemizedItemEdit = this.props.onItemizedItemEdit;
    var currency = this.props.currency;
    var rowDel = this.props.onRowDel;
    var itemTable = this.props.items.map(function(item) {
      return (
        <ItemRow onItemizedItemEdit={onItemizedItemEdit} item={item} onDelEvent={rowDel.bind(this)} key={item.id} currency={currency}/>
      )
    });
    return (
      <div>
        <div style={{ overflowX: 'auto' }}>
          <Table className="mb-0" style={{ background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', fontWeight: 'bold', color: '#374151' }}>ITEM</th>
                <th style={{ padding: '1rem', fontWeight: 'bold', color: '#374151' }}>QTY</th>
                <th style={{ padding: '1rem', fontWeight: 'bold', color: '#374151' }}>PRICE/RATE</th>
                <th className="text-center" style={{ padding: '1rem', fontWeight: 'bold', color: '#374151' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {itemTable}
            </tbody>
          </Table>
        </div>
        <Button className="fw-bold mt-4" onClick={this.props.onRowAdd} style={{ background: '#2563eb', borderRadius: '0.5rem', padding: '0.5rem 1.5rem' }}>
          + Add Item
        </Button>
      </div>
    );
  }
}

class ItemRow extends React.Component {
  onDelEvent() {
    this.props.onDelEvent(this.props.item);
  }
  render() {
    return (
      <tr style={{ borderBottom: '1px solid #e5e7eb', hover: '#f9fafb' }}>
        <td style={{ width: '100%', padding: '1rem' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
            type: "text",
            name: "name",
            placeholder: "Item name",
            value: this.props.item.name,
            id: this.props.item.id,
          }}/>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
            type: "text",
            name: "description",
            placeholder: "Item description",
            value: this.props.item.description,
            id: this.props.item.id
          }}/>
        </td>
        <td style={{ minWidth: '80px', padding: '1rem', verticalAlign: 'middle' }}>
          <EditableField
          onItemizedItemEdit={this.props.onItemizedItemEdit}
          cellData={{
            type: "number",
            name: "quantity",
            min: 1,
            step: "1",
            value: this.props.item.quantity,
            id: this.props.item.id,
          }}/>
        </td>
        <td style={{ minWidth: '140px', padding: '1rem', verticalAlign: 'middle' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
            leading: this.props.currency,
            type: "number",
            name: "price",
            min: 0,
            step: "0.01",
            presicion: 2,
            textAlign: "text-end",
            value: this.props.item.price,
            id: this.props.item.id,
          }}/>
        </td>
        <td className="text-center" style={{ minWidth: '60px', padding: '1rem', verticalAlign: 'middle' }}>
          <button 
            onClick={this.onDelEvent.bind(this)}
            style={{
              background: '#ef4444',
              border: 'none',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontSize: '1.2rem',
              lineHeight: '1'
            }}
            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
          >
            ✕
          </button>
        </td>
      </tr>
    );
  }
}

export default InvoiceItem;