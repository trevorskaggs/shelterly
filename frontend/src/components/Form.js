import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext, useField } from 'formik';
import { Col, Collapse, Image, Form, Row } from 'react-bootstrap';
import Select, { createFilter } from 'react-select';
import SimpleValue from 'react-select-simple-value';
import Flatpickr from 'react-flatpickr';
import ImageUploading from 'react-images-uploading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faMinusSquare, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import Autocomplete from 'react-google-autocomplete';
import { Map, Marker, Tooltip as MapTooltip, TileLayer } from "react-leaflet";
import flatten from 'flat';
import clsx from 'clsx';
import MaterialCheckbox from '@material-ui/core/Checkbox';
import {
  useRegisteredRef
} from "react-register-nodes";
import { makeStyles } from '@material-ui/core/styles';
import Alert from 'react-bootstrap/Alert';
import { Legend, pinMarkerIcon } from "../components/Map";
import { STATE_OPTIONS } from '../constants';
import moment from "moment";

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: 3,
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '$root.Mui-focusVisible &': {
      outline: '2px auto rgba(19,124,189,.6)',
      outlineOffset: 2,
    },
    'input:hover ~ &': {
      backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#137cbd',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: '#106ba3',
    },
  },
});

const DateRangePicker = ({...props}) => {

  let options = {allowInput: true, dateFormat: "Y-m-d", mode: "range", maxDate: moment().format('YYYY-MM-DD')}
  return (
    <>
      <Flatpickr className="daterange_picker" options={options} {...props} />
    </>
  );
};

const DateTimePicker = ({ label, xs, clearable, ...props }) => {

  const [field, meta] = useField(props);

  const registeredRef = useRegisteredRef(props.name);
  const datetime = useRef(null);

  useEffect(() => {
    datetime.current.flatpickr.altInput.disabled = props.disabled;
  }, [props.disabled]);

  // Ref and function to clear field.
  const clearDate = useCallback(() => {
    if (datetime.current) {
      datetime.current.flatpickr.clear();
    }
  }, [datetime]);

  // Flatpickr options
  let options = {};
  if (props["data-enable-time"] === false) {
    options = {allowInput:true, altInput: true, altFormat: "F j, Y", dateFormat: "Y-m-d H:i"}
  }
  else {
    options = {allowInput:true, altInput: true, altFormat: "F j, Y H:i", dateFormat: "Y-m-d H:i"}
  }

  return (
    <>
      <Form.Group as={Col} xs={xs} hidden={props.hidden} className="mb-0" ref={meta.error && registeredRef}>
      <label htmlFor={props.id || props.name}>{label}</label>
      <span className="d-flex">
        <Flatpickr className="datetime_picker" ref={datetime} data-enable-time options={options} {...field} {...props} />
        {clearable === false || props.disabled === true ? "" : <span>{field.value ? <FontAwesomeIcon icon={faTimes} style={{position:"relative", left: "-22px", marginTop:"11px", marginRight:"-10px", color:"#808080"}} onClick={clearDate} /> : ""}</span>}
      </span>
      {meta.touched && meta.error ? <div style={{ color: "#e74c3c", marginTop: ".3rem", fontSize: "80%" }}>{meta.error}</div> : ""}
      </Form.Group>
    </>
  );
};

const TextInput = ({ label, xs, controlId, formGroupClasses, ...props }) => {

  const [field, meta] = useField(props);

  const registeredRef = useRegisteredRef(props.name);

  return (
    <>
    <Form.Group as={Col} xs={xs} controlId={controlId} className={formGroupClasses} hidden={props.hidden} ref={meta.error && registeredRef}>
      <Form.Label>{label}</Form.Label>
      <Form.Control type="text" isInvalid={meta.touched && meta.error} onChange={props.handleChange} {...field} {...props} />
      <Form.Control.Feedback type="invalid"> {meta.error}</ Form.Control.Feedback>
    </Form.Group>
    </>
  );
};

const Checkbox = (props) => {

  const classes = useStyles();
  // const [field, meta] = useField({...props, type: 'checkbox'});

  return (
    <>
    {props.label}
    <MaterialCheckbox
      className={classes.root}
      disableRipple
      color="default"
      checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
      icon={<span className={classes.icon} />}
      inputProps={{ 'aria-label': 'decorative checkbox' }}
      {...props}
    />
    {/* {meta.touched && meta.error ? (
      <div className="error">{meta.error}</div>
    ) : null} */}
    </>
  );
};

const DropDown = React.forwardRef((props, ref) => {
  const { setFieldValue, errors, setFieldTouched, isSubmitting, isValidating } = useFormikContext();
  const [field, meta] = useField(props);

  const registeredRef = useRegisteredRef(props.name);

  const filterConfig = {matchFrom:"start"}

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
    <div ref={meta.error && registeredRef}>
      {props.label ? <Form.Label style={props.style}>{props.label}</Form.Label> : ""}
      <SimpleValue {...field} options={props.options}>
         {simpleProps => <Select isDisabled={props.disabled} ref={ref} styles={customStyles} isClearable={true} filterOption={createFilter(filterConfig)} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
      </SimpleValue>
      {meta.touched && meta.error ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{meta.error}</div> : ""}
    </div>
    </>
  );
});

const ImageUploader = ({ parentStateSetter, ...props }) => {

  const { setFieldValue } = useFormikContext();
  const [childState, setChildState] = useState(0);
  const [meta] = useField(props);

  useEffect(() => {
    // Call parent function to update parent state.
    parentStateSetter(childState);
  }, [parentStateSetter, childState]);

  return (
    <>
      <ImageUploading
        {...props}
        onChange={(imageList) => {
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
          dragProps,
          errors
        }) => (
          <span className="d-flex flex-wrap align-items-end">
            {imageList.map((image, index) => (
              <span key={index} className="mt-2 mr-3">
                <Image width={131} src={image.data_url} alt="Animal" thumbnail />
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
  const { setFieldValue } = useFormikContext();

  const updateAddr = suggestion => {

    if (suggestion.address_components) {
      // Extract location information from the return. Use short_name for the state.
      let components={};
      suggestion.address_components.forEach(function(k,v1) {k.types.forEach(function(v2, k2){v2 !== "administrative_area_level_1" ? components[v2]=k.long_name : components[v2]=k.short_name});});

      // Build formatted street number + name string.
      let address = "";
      if (components.street_number) {
        address = components.street_number + " " + components.route;
      }
      else if (components.route) {
        address = components.route;
      }
      else {
        address = components.intersection;
      }

      setFieldValue("address", address);
      setFieldValue("city", components.locality);
      setFieldValue("state", components.administrative_area_level_1);
      setFieldValue("zip_code", components.postal_code);
      setFieldValue("latitude", suggestion.geometry.location.lat());
      setFieldValue("longitude", suggestion.geometry.location.lng());
      setFieldValue("full_address", suggestion.formatted_address.replace(', USA', ''));
      props.setLatLon(suggestion.geometry.location.lat(), suggestion.geometry.location.lng())
    }
  }

  return (
    <>
      <Form.Label>{props.label}</Form.Label>
      <Autocomplete
        {...props}
        onChange={(e) => {
          const lookup = e.target.value.replace(' ', '').split(',');
          if (lookup[0] <= 90 && lookup[0] >= -90 && lookup[1] <= 180 && lookup[1] >= -180) {
          let latlng = {lat:Number(lookup[0]), lng:Number(lookup[1])};
          new window.google.maps.Geocoder().geocode({ location: latlng }, function (results, status) {
            if (status === window.google.maps.GeocoderStatus.OK) {
              updateAddr(results[0]);
            }
          });
          }
        }}
        onPlaceSelected={(place) => {
          updateAddr(place);
        }}
        types={['geocode']}
        componentRestrictions={{country: "us"}}
        ref={childRef}
        apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      />
    </>
  );
}

const AddressSearch = (props) => {

  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const { setFieldValue } = useFormikContext();
  const [initialLatLon, setInitialLatLon] = useState([0, 0]);

  const setLatLon = (lat, lon) => {
    setInitialLatLon([lat, lon]);
  }

  const renderAddressLookup = () => {
    if (process.env.REACT_APP_GOOGLE_API_KEY) {
      return <AddressLookup label={props.label} style={{width: '100%'}} className={"form-control"} setLatLon={setLatLon} />
    } else {
      return <Alert variant="danger">Found Location Search is not available. Please contact support for assistance.</Alert>
    }
  }

  const updatePosition = () => {
      const marker = markerRef.current;
      const map = mapRef.current
      if (marker !== null) {
        const latLon = marker.leafletElement.getLatLng();
        // Preserve the original map center LatLon.
        if (initialLatLon[0] === 0) {
          setInitialLatLon([props.formikProps.values.latitude, props.formikProps.values.longitude])
        }
        setFieldValue("latitude", +(Math.round(latLon.lat + "e+4") + "e-4"));
        setFieldValue("longitude", +(Math.round(latLon.lng + "e+4") + "e-4"));
        map.leafletElement.setView(latLon);
      }
  }

  const [fadeIn, setFadeIn] = useState(props.show_same ? false : true);
  function handleChange() {
    setFadeIn(!fadeIn);
    setTimeout(() => {
      mapRef.current.leafletElement.invalidateSize();
    }, 250)
  }

  return (
    <>
    {props.show_same ?
      <span className="form-row mb-2">
        <Form.Label style={{marginLeft:"5px"}}>Address Same as Owner: </Form.Label>
        <input id="same_address" type="checkbox" className="ml-2" checked={!fadeIn} onChange={handleChange} style={{marginTop:"5px"}} />
      </span>
    : ""}
    <Collapse in={fadeIn}>
      <div>
        <Row hidden={props.hidden} style={{fontSize:"15px"}}>
          <Col>
            <Form.Row>
              <Form.Group as={Col} xs="12">
                {renderAddressLookup()}
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <TextInput
                xs={props.show_apt ? "10" : "12"}
                type="text"
                label="Address"
                name="address"
                value={props.formikProps.values.address || ''}
                disabled
              />
              {props.show_apt ?
                <TextInput
                  xs="2"
                  type="text"
                  label="Apartment"
                  name="apartment"
                  value={props.formikProps.values.apartment || ''}
                />
              : ""}
            </Form.Row>
            <Form.Row>
              <TextInput
                xs="8"
                type="text"
                label="City"
                name="city"
                value={props.formikProps.values.city || ''}
                disabled
              />
              <Col xs="2">
              <DropDown
                label="State"
                name="state"
                id="state"
                options={STATE_OPTIONS}
                placeholder=''
                disabled
              />
              </Col>
              <TextInput
                xs="2"
                type="text"
                label="Zip Code"
                name="zip_code"
                value={props.formikProps.values.zip_code || ''}
                disabled
              />
            </Form.Row>
          </Col>
          <Col className="border rounded pl-0 pr-0 mb-3 mr-3" xs="4" style={{marginTop:"31px"}}>
            <Map zoom={15} ref={mapRef} center={[initialLatLon[0] || props.formikProps.values.latitude || 0, initialLatLon[1] || props.formikProps.values.longitude || 0]} className="search-leaflet-container" >
            <Legend position="bottomleft" metric={false} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
              {props.formikProps.values.latitude && props.formikProps.values.longitude ?
              <Marker
                draggable={true}
                onDragEnd={updatePosition}
                autoPan={true}
                position={[props.formikProps.values.latitude, props.formikProps.values.longitude]}
                icon={pinMarkerIcon}
                ref={markerRef}
              >
                <MapTooltip autoPan={false} direction="top">
                  <div>
                    {props.formikProps.values.full_address}
                  </div>
                  <div>
                    Lat: {props.formikProps.values.latitude}, Lon: {props.formikProps.values.longitude}
                  </div>
                </MapTooltip>
              </Marker>
              : ""}
            </Map>
          </Col>
        </Row>
      </div>
    </Collapse>
    </>
  );
}

export { AddressLookup, AddressSearch, TextInput, Checkbox, DropDown, ImageUploader, DateTimePicker, DateRangePicker };
