import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class EditableField extends React.Component {
  render() {
    return (
      <InputGroup className="my-2 flex-nowrap">
        {
          this.props.cellData.leading != null &&
          <InputGroup.Text
            className="bg-light fw-bold border-0 text-secondary px-3"
            style={{ borderRadius: '0.5rem 0 0 0.5rem' }}>
            <span className="border border-2 border-secondary rounded-circle d-flex align-items-center justify-content-center small" style={{width: '24px', height: '24px', fontWeight: 'bold'}}>
              {this.props.cellData.leading}
            </span>
          </InputGroup.Text>
        }
        <Form.Control
          className={`${this.props.cellData.textAlign} rounded-2`}
          type={this.props.cellData.type}
          placeholder={this.props.cellData.placeholder}
          min={this.props.cellData.min}
          name={this.props.cellData.name}
          id={this.props.cellData.id}
          value={this.props.cellData.value}
          step={this.props.cellData.step}
          presicion={this.props.cellData.presicion}
          aria-label={this.props.cellData.name}
          onChange={this.props.onItemizedItemEdit}
          style={{
            borderRadius: this.props.cellData.leading ? '0 0.5rem 0.5rem 0' : '0.5rem',
            borderColor: '#e5e7eb',
            fontSize: '0.95rem',
            padding: '0.6rem 0.75rem'
          }}
          required
        />
      </InputGroup>
    );
  }
}

export default EditableField;