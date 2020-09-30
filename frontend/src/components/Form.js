import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext, useField } from 'formik';
import { Label, Input } from 'reactstrap';
import { Col, Form } from 'react-bootstrap';
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import Flatpickr from 'react-flatpickr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Autocomplete from 'react-google-autocomplete';

const DateTimePicker = ({ label, xs, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field] = useField(props);

  // Ref and function to clear field.
  const datetime = useRef(null);
  const clearDate = useCallback(() => {
    if (datetime.current) {
      datetime.current.flatpickr.clear();
    }
  }, [datetime]);

  // Flatpickr options
  var options = {allowInput:true, altInput: true, altFormat: "F j, Y h:i K",}

  return (
    <>
      <Form.Group as={Col} xs={xs} className="mb-0">
      <label htmlFor={props.id || props.name}>{label}</label>
      <span className="container">
        <Flatpickr ref={datetime} data-enable-time options={options} {...field} {...props} />
        {field.value ? <span className="float-right mr-4"><FontAwesomeIcon icon={faTimes} style={{position:"absolute", bottom:"34px", color:"#808080"}} onClick={clearDate} /></span> : ""}
      </span>
      </Form.Group>
    </>
  );
};

// ...props is shorthand for "rest of the items in this array". So the 1st item is
// assigned to label and the rest are assigned to props
const TextInput = ({ label, value, xs, controlId, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
    <Form.Group as={Col} xs={xs} controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control type="text" value={value} isInvalid={meta.touched && meta.error} onChange={props.handleChange} {...field} {...props} />
        <Form.Control.Feedback type="invalid"> {meta.error}</ Form.Control.Feedback>
    </Form.Group>
    </>
  );
};

const Checkbox = ({ children, ...props }) => {
  // We need to tell useField what type of input this is
  // since React treats radios and checkboxes differently
  // than inputs/select/textarea.
  const [field, meta] = useField({ ...props, type: 'checkbox' });
  return (
    <>
      <Label className="checkbox">
        <input type="checkbox" {...field} {...props} />
        {children}
      </Label>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};

const DropDown = React.forwardRef((props, ref) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(props);

  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles, { isDisabled}) => {
      return {
        ...styles,
        color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
        backgroundColor: isDisabled ? '#DFDDDD' : 'white',
        height: 35,
        minHeight: 35
      }
    },
    option: provided => ({
      ...provided,
      color: 'black'
    }),
  };

  function handleOptionChange(selection) {
    if (selection) {
      setFieldValue(props.name, selection.value);
    }
    else {
      setFieldValue(props.name, '');
    }
  }

  function updateBlur() {
    setFieldTouched(props.name, true);
  }

  return (
    <>
      <Form.Label >{props.label}</Form.Label>
      <SimpleValue {...field} options={props.options} value={props.value}>
         {simpleProps => <Select isDisabled={props.disabled} ref={ref} styles={customStyles} isClearable={true} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
      </SimpleValue>
      {meta.touched && meta.error ? <div style={{ color: "red", marginTop: ".5rem", fontSize: "80%" }}>{meta.error}</div> : ""}
    </>
  );
});

const MultiSelect = ({ label, ...props }) => {
  const [field] = useField(props);
  return (
    <>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Input type="select" {...field} {...props} multiple={true} />
    </>
  );
};

const AddressLookup = ({ ...props }) => {

  const childRef = useRef(null);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  const updateAddr = suggestion => {
    // Extract location information from the return. Use short_name for the state.
    var components={};
    suggestion.address_components.forEach(function(k,v1) {k.types.forEach(function(v2, k2){v2 !== "administrative_area_level_1" ? components[v2]=k.long_name : components[v2]=k.short_name});});

    // Build formatted street number + name string.
    var address = "";
    if (components.street_number) {
      address = components.street_number + " " + components.route;
    }
    else {
      address = components.route;
    }

    setFieldValue("address", address);
    setFieldValue("city", components.locality);
    setFieldValue("state", components.administrative_area_level_1);
    setFieldValue("zip_code", components.postal_code);
    setFieldValue("latitude", suggestion.geometry.location.lat());
    setFieldValue("longitude", suggestion.geometry.location.lng());
  }

  return (
    <>
      <Label>{props.label}</Label>
      <Autocomplete
        {...props}
        onPlaceSelected={(place) => {
          updateAddr(place);
        }}
        types={['address']}
        componentRestrictions={{country: "us"}}
        ref={childRef}
        apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      />
    </>
  );
}

export { AddressLookup, TextInput, Checkbox, DropDown, MultiSelect, DateTimePicker };
