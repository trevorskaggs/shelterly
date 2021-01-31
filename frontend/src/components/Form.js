import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext, useField } from 'formik';
import { Label, Input } from 'reactstrap';
import { Col, Image, Form } from 'react-bootstrap';
import Select from 'react-select';
import SimpleValue from 'react-select-simple-value';
import Flatpickr from 'react-flatpickr';
import ImageUploading from 'react-images-uploading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faMinusSquare, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import Autocomplete from 'react-google-autocomplete';
import flatten from 'flat';

const DateTimePicker = ({ label, xs, clearable, ...props }) => {

  const [field, meta] = useField(props);

  // Ref and function to clear field.
  const datetime = useRef(null);
  const clearDate = useCallback(() => {
    if (datetime.current) {
      datetime.current.flatpickr.clear();
    }
  }, [datetime]);

  // Flatpickr options
  var options = {};
  if (props["data-enable-time"] === false) {
    options = {allowInput:true, altInput: true, altFormat: "F j, Y", dateFormat: "M d Y H:i"}
  }
  else {
    options = {allowInput:true, altInput: true, altFormat: "F j, Y H:i", dateFormat: "M d Y H:i"}
  }

  return (
    <>
      <Form.Group as={Col} xs={xs} hidden={props.hidden} className="mb-0">
      <label htmlFor={props.id || props.name}>{label}</label>
      <span className="d-flex">
        <Flatpickr className="datetime_picker" ref={datetime} data-enable-time options={options} {...field} {...props} />
        {clearable === false ? "" : <span>{field.value ? <FontAwesomeIcon icon={faTimes} style={{position:"relative", left: "-22px", marginTop:"11px",color:"#808080"}} onClick={clearDate} /> : ""}</span>}
      </span>
      {meta.touched && meta.error ? <div style={{ color: "#e74c3c", marginTop: ".3rem", fontSize: "80%" }}>{meta.error}</div> : ""}
      </Form.Group>
    </>
  );
};

// ...props is shorthand for "rest of the items in this array". So the 1st item is
// assigned to label and the rest are assigned to props
const TextInput = ({ label, value, xs, controlId, formGroupClasses, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
    <Form.Group as={Col} xs={xs} controlId={controlId} className={formGroupClasses} hidden={props.hidden}>
      <Form.Label>{label}</Form.Label>
      <Form.Control type="text" value={value} isInvalid={meta.touched && meta.error} onChange={props.handleChange} {...field} {...props} />
      <Form.Control.Feedback type="invalid"> {meta.error}</ Form.Control.Feedback>
    </Form.Group>
    </>
  );
};

const Checkbox = ({ field, checked, label, onChange }) => {

  // const [field, meta] = useField({...props, type: 'checkbox'});

  return (
    <>
    <label>
      {label}
      <input {...field} type="checkbox" checked={checked} onChange={onChange} />
    </label>
    {/* {meta.touched && meta.error ? (
      <div className="error">{meta.error}</div>
    ) : null} */}
    </>
  );
};

const DropDown = React.forwardRef((props, ref) => {
  const { setFieldValue, errors, setFieldTouched, isSubmitting, isValidating } = useFormikContext();
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

  useEffect(() => {
    if (isSubmitting && !isValidating) {
      for (const path of Object.keys(flatten(errors))) {
        setFieldTouched(path, true, false);
      }
    }
  }, [errors, isSubmitting, isValidating, setFieldTouched]);

  function handleOptionChange(selection) {
    setFieldTouched(props.name, true);
    setFieldValue(props.name, selection === null ? '' : selection.value);
  }

  function updateBlur() {
    setFieldTouched(props.name, true);
  }

  return (
    <>
      {props.label ? <Form.Label style={props.style}>{props.label}</Form.Label> : ""}
      <SimpleValue {...field} options={props.options}>
         {simpleProps => <Select isDisabled={props.disabled} ref={ref} styles={customStyles} isClearable={true} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
      </SimpleValue>
      {meta.touched && meta.error ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{meta.error}</div> : ""}
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

const ImageUploader = ({ parentStateSetter, ...props }) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
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
          if (!props.multiple) {
            // Set file to field if it exists.
            if (imageList[0]) {
              setFieldValue(props.id, imageList[0].file);
              setFieldValue(props.id + '_data_url', imageList[0].data_url);
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
          <span className="d-flex flex-wrap align-items-end">
            {imageList.map((image, index) => (
              <span key={index} className="mt-2 mr-3">
                <Image width={131} src={image.data_url} alt="" thumbnail />
                <div className="image-item__btn-wrapper">
                  <FontAwesomeIcon icon={faMinusSquare} inverse onClick={() => onImageRemove(index)} style={{backgroundColor:"red"}} />
                  <span className="ml-1">{props.label}</span>
                </div>
              </span>
            ))}
            {imageList.length < props.maxNumber ?
              <span className="d-flex flex-wrap m-0">
                <span className="text-center ml-0 mr-3 p-0 align-items-end" style={{marginBottom:"-20px"}}>
                <FontAwesomeIcon icon={faPlusSquare} size="10x" inverse onClick={onImageUpload}{...dragProps} />
                  <div style={{marginTop:-8, marginBottom:20}}>{props.label}</div>
                  {(meta.touched && meta.error) || errors ?
                    <div style={{ color:"#e74c3c", fontSize:"80%", marginTop:"-20px", marginBottom:"-20px" }}>
                      {meta.error ?
                        <span className="text-left">{meta.error}</span> :
                        <span>
                          {errors.maxNumber && <span>Maximum Exceeded</span>}
                          {errors.acceptType && <span>Invalid file type</span>}
                        </span>
                      }
                    </div> : <div style={{ marginBottom:"20px" }}></div>
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

const AddressLookup = ({ ...props }) => {

  const childRef = useRef(null);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  const updateAddr = suggestion => {
    if (suggestion.address_components) {
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

export { AddressLookup, TextInput, Checkbox, DropDown, ImageUploader, MultiSelect, DateTimePicker };
