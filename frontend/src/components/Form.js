import React, { useCallback, useRef } from 'react';
import { useFormikContext, useField } from 'formik';
import { FormFeedback, Label, Input } from 'reactstrap';
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import 'bootstrap/dist/css/bootstrap.min.css';
import Flatpickr from 'react-flatpickr';

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
      <label className="mr-2" htmlFor={props.id || props.name}>{label}</label>
      <Flatpickr className="w-25" ref={datetime} data-enable-time options={options} {...field} {...props} />
      <button type="button" className="btn btn-primary ml-1" onClick={clearDate}>Clear</button>
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
      <Label htmlFor={props.id || props.name} className="mt-3">{label}</Label>
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
      setFieldValue(props.name, null);
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
        <Input type="select" {...field} {...props} multiple={true}/>
      </>
    );
  };

export { TextInput, Checkbox, DropDown, MultiSelect, DateTimePicker };
