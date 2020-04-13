import React from 'react';
import { useFormikContext, useField } from 'formik';
import { FormFeedback, Label, Input } from 'reactstrap';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

// ...props is shorthand for "rest of the items in this array". So the 1st item is
// assigned to label and the rest are assigned to props
const TextInput = ({ label, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Input className={meta.touched && meta.error ? "is-invalid" : null} {...field} {...props} />
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

const DropDown = ({ options, label, ...props }) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(props);

  function handleOptionChange(selection) {
    setFieldValue(props.name, selection);
  }

  function updateBlur() {
    setFieldTouched(props.name, true);
  }

  return (
    <>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Select options={options} {...field} {...props} onBlur={updateBlur} onChange={handleOptionChange}/>
      {/* {meta.touched && meta.error ? (
        <span>{meta.error}</span>
      ) : null} */}
    </>
  );
};

const MultiSelect = ({ label, ...props }) => {
    const [field] = useField(props);
    return (
      <>
        <Label htmlFor={props.id || props.name}>{label}</Label>
        <Input type="select" {...field} {...props} multiple={true}/>
      </>
    );
  };
  
export { TextInput, Checkbox, DropDown, MultiSelect };