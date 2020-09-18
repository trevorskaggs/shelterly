import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext, useField } from 'formik';
import { Label, Input } from 'reactstrap';
import { Col, Image, Form } from 'react-bootstrap';
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import Flatpickr from 'react-flatpickr';
import ImageUploading from "react-images-uploading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faMinusSquare, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';

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

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: 'black',
  }),

}


const DropDown = React.forwardRef((props, ref) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(props);

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
         {simpleProps => <Select ref={ref} styles={customStyles} isClearable={true} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
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

const ImageUploader = ({ parentStateSetter, setFieldValue, ...props }) => {

  const [childState, setChildState] = useState(0);
  const [field, meta] = useField(props);

  useEffect(() => {
    // Call parent function to update parent state.
    parentStateSetter(childState);
  }, [parentStateSetter, childState]);

  return (
    <>
      <ImageUploading
        {...props}
        onChange={(imageList, addUpdateIndex) => {
          setChildState(imageList);
          // Update corresponding field when it's a single image input.
          if (!props.multiple) {
            // Set file to field if it exists.
            if (imageList[0]) {
              setFieldValue(props.id, imageList[0].file);
            }
            // Else reset to null.
            else {
              setFieldValue(props.id, null);
            }
          }
        }}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          isDragging,
          dragProps,
          errors
        }) => (
          <span className="row">
            {imageList.map((image, index) => (
              <span key={index} className="image-item mt-2">
                {props.maxNumber === 1 ?
                <Image width={131} src={image.data_url} alt="" thumbnail /> :
                <span className="mr-3"><Image width={145} src={image.data_url} alt="" thumbnail /></span>}
                <div className="image-item__btn-wrapper">
                  <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => onImageRemove(index)} style={{backgroundColor:"red"}} />
                  <span className="ml-1">{props.label}</span>
                </div>
              </span>
            ))}
            {imageList.length < props.maxNumber ?
              <span className="row mr-0 ml-0">
                <span className="text-center"><FontAwesomeIcon icon={faPlusSquare} size="10x" inverse onClick={onImageUpload}{...dragProps} />
                  <div style={{marginTop:-8}}>{props.label}</div>
                  {(meta.touched && meta.error) || errors ?
                    <div style={{ color: "red", fontSize: "80%" }}>
                      {meta.error ?
                        <span className="text-left">{meta.error}</span> :
                        <span style={{display:"block", width:"145px",wordWrap:"break-word"}}>
                          {errors.maxNumber && <span>Number of selected images exceed maxNumber</span>}
                          {errors.acceptType && <span>Your selected file type is not allow</span>}
                          {errors.maxFileSize && <span>Selected file size exceed maxFileSize</span>}
                          {errors.resolution && <span>Selected file is not match your desired resolution</span>}
                        </span>
                      }
                    </div> : ""
                  }
                </span>
              </span> : ""
            }
          </span>
        )}
      </ImageUploading>
    </>
  );
}

export { TextInput, Checkbox, DropDown, ImageUploader, MultiSelect, DateTimePicker };
