import React, { useCallback, useRef } from 'react';
import { useFormikContext, useField } from 'formik';
import { FormFeedback, Label, Input } from 'reactstrap';
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import Flatpickr from 'react-flatpickr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const DateTimePicker = ({ label, ...props }) => {
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
      <label className="mt-3" htmlFor={props.id || props.name}>{label}</label>
      <span className="container">
        <Flatpickr ref={datetime} data-enable-time options={options} {...field} {...props} />
        {field.value ? <span className="float-right mr-4"><FontAwesomeIcon icon={faTimes} style={{position:"absolute", bottom:"34px", color:"#808080"}} onClick={clearDate} /></span> : ""}
      </span>
    </>
  );
};

// ...props is shorthand for "rest of the items in this array". So the 1st item is
// assigned to label and the rest are assigned to props
const TextInput = ({ label, value, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
      <Label className="mt-3" htmlFor={props.id || props.name}>{label}</Label>
      <Input value={value} className={meta.touched && meta.error ? "is-invalid" : null} {...field} {...props} />
      {meta.touched && meta.error ? (
        <FormFeedback>{meta.error}</FormFeedback>
      ) : null}
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
  const [field] = useField(props);

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
      <Label htmlFor={props.id || props.name} className="mt-3">{props.label}</Label>
      <SimpleValue {...field} options={props.options} value={props.value}>
         {simpleProps => <Select ref={ref} isClearable={true} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
      </SimpleValue>
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

export { TextInput, Checkbox, DropDown, MultiSelect, DateTimePicker };
