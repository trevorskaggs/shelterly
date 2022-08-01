import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useFormikContext, useField } from 'formik';
import { Button, Col, Image, Form, OverlayTrigger, Tooltip, Row } from 'react-bootstrap';
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
import imageCompression from 'browser-image-compression';

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

  let options = {allowInput: true, dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}
  return (
    <>
      <Flatpickr className="daterange_picker" options={options} {...props} style={{...props.style, borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}} />
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
        <Flatpickr className="datetime_picker" ref={datetime} data-enable-time options={{...options, ...props.more_options}} {...field} {...props} />
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
      {props.tooltip ?
      <OverlayTrigger
        key={"text-input"}
        placement="top"
        overlay={
          <Tooltip id={`tooltip-text-input`}>
            {props.tooltip}
          </Tooltip>
        }
      >
        <Form.Control type="text" isInvalid={meta.touched && meta.error} {...field} {...props} />
      </OverlayTrigger>
      :
        <Form.Control type="text" isInvalid={meta.touched && meta.error} {...field} {...props} />
      }
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
  const { setFieldValue, setFieldTouched } = useFormikContext();
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
    singleValue: (styles, { isDisabled }) => ({
      ...styles,
      color: isDisabled ? '#595959' : 'black'
    }),
  };

  function handleOptionChange(selection) {
    setFieldTouched(props.name, true);
    setFieldValue(props.name, selection === null ? '' : selection.value);
  }

  function updateBlur() {
    setFieldTouched(props.name, true);
  }

  // useEffect(() => {
  //   if (isSubmitting && !isValidating) {
  //     for (const path of Object.keys(flatten(errors))) {
  //       setFieldTouched(path, true, false);
  //     }
  //   }
  // }, [errors, isSubmitting, isValidating, setFieldTouched]);

  return (
    <>
    <div ref={meta.error && registeredRef}>
      {props.label ? <Form.Label style={props.style}>{props.label}</Form.Label> : ""}
      {props.tooltip ?
      <OverlayTrigger
         key={"edit-service-request"}
         placement="top"
         overlay={
           <Tooltip id={`tooltip-edit-service-request`}>
             {props.tooltip}
           </Tooltip>
         }
       >
        <span>
          <SimpleValue {...field} options={props.options}>
            {simpleProps => <Select isDisabled={props.disabled} ref={ref} styles={customStyles} isClearable={true} onBlur={updateBlur} filterOption={createFilter(filterConfig)} onChange={handleOptionChange} {...props} {...simpleProps} />}
          </SimpleValue>
        </span>
      </OverlayTrigger>
      :
      <SimpleValue {...field} options={props.options}>
        {simpleProps => <Select isDisabled={props.disabled} ref={ref} styles={customStyles} isClearable={true} filterOption={createFilter(filterConfig)} onBlur={updateBlur} onChange={handleOptionChange} {...props} {...simpleProps} />}
      </SimpleValue>
      }
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
        onChange={ async (imageList) => {
          setChildState(imageList);
          if (!props.multiple) {
            // Set file to field if it exists.
            if (imageList[0]) {
              const options = {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920,
                useWebWorker: true
              }
              const compressedFile = await imageCompression(imageList[0].file, options);
              setFieldValue(props.id, compressedFile);
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
                  <span className="ml-1">{props.label || image.file.name}</span>
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

const AddressLookup = ({setLatLon, ...props}) => {

  const childRef = useRef(null);
  const { setFieldValue, values } = useFormikContext();
  const [timer, setTimer] = useState(null);
  const [error, setError] = useState('');
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [search, setSearch] = useState({});
  const [incidentLatLon, setIncidentLatLon] = useState({lat:0, lng:0});

  function changeDelay(change) {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setTimer(
      setTimeout(() => {
        setSearch(change);
      }, 2500)
    );
  }

  const clearAddress = () => {
    childRef.current.refs.input.value = "";
    childRef.current.refs.input.focus();
    setFieldValue("address", "");
    setFieldValue("city", "");
    setFieldValue("state", "");
    setFieldValue("zip_code", "");
    setFieldValue("latitude", null);
    setFieldValue("longitude", null);
    setFieldValue("full_address", "");
    setLatLon(0, 0);
  };


  useEffect(() => {
    if ((childRef.current && (childRef.current.refs.input.value.includes(", USA") || childRef.current.refs.input.value.includes(", United")))) {
      setError("");
    }
    updateAddr(search);

    let unmounted = false;
    let source = axios.CancelToken.source();

    axios.get('/incident/api/incident/?incident=' + props.incident, {
      cancelToken: source.token,
    })
    .then(response => {
      if (!unmounted) {
        setIncidentLatLon({lat:Number(response.data[0].latitude), lng:Number(response.data[0].longitude)})
      }
    })
    .catch(error => {
    });
  }, [triggerRefresh, search, props.incident]);

  const updateAddr = suggestion => {

    if (suggestion && suggestion.address_components) {
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
      setFieldValue("city", components.locality || '');
      setFieldValue("state", components.administrative_area_level_1);
      setFieldValue("zip_code", components.postal_code);
      setFieldValue("latitude", suggestion.geometry.location.lat());
      setFieldValue("longitude", suggestion.geometry.location.lng());
      setFieldValue("full_address", suggestion.formatted_address.replace(', USA', ''));
      setLatLon(suggestion.geometry.location.lat(), suggestion.geometry.location.lng());
      setSearch({});
    }
  }

  return (
    <>
      <Form.Label>{props.label}</Form.Label>
      <Row className="mr-0 d-flex" style={{maxHeight:"37px"}}>
        <Col className="flex-grow-1 pr-1">
          <Autocomplete
            {...props}
            onChange={(e) => {
              setError("");
              const lookup = e.target.value.replace(' ', '').split(',');
              if (lookup[0] <= 90 && lookup[0] >= -90 && lookup[1] <= 180 && lookup[1] >= -180) {
                let latlng = {lat:Number(lookup[0]), lng:Number(lookup[1])};
                new window.google.maps.Geocoder().geocode({ location: latlng }, function (results, status) {
                  if (status === window.google.maps.GeocoderStatus.OK) {
                    // Filter out results that do not have a road name.
                    // Delay lookup to reduce number of calls while user is typing.
                    changeDelay(results.filter(result => !result.address_components[0].long_name.includes('+'))[0]);
                  }
                });
              }
            }}
            onPlaceSelected={(place) => {
              setSearch(place);
            }}
            onBlur={(e) => {
              setError("");
              setTriggerRefresh(!triggerRefresh)
              if (!values.address && childRef.current && childRef.current.refs.input.value) {
                setError(props.error);
              }
            }}
            bounds={{north:incidentLatLon.lat+.1, south:incidentLatLon.lat-.1, east:incidentLatLon.lng+.1, west:incidentLatLon.lng-.1}}
            types={['geocode']}
            id="search"
            name="search"
            disabled={props.disabled}
            key={`search_key__${String(incidentLatLon.lat)}`}
            componentRestrictions={{country: "us"}}
            ref={childRef}
            apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
          />
          {error ? <div style={{ color: "#e74c3c", marginTop: "1px", marginBottom:error ? "-15px" : "0px", fontSize: "80%" }}>{error}</div> : ""}
        </Col>
        <Button variant="outline-light" className="float-right" style={{maxHeight:"37px"}} onClick={clearAddress} disabled={!values.address || props.disabled ? true : false}>Clear</Button>
      </Row>
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
      return <AddressLookup label={props.label} style={{width: '100%'}} className={"form-control"} setLatLon={setLatLon} error={props.error} incident={props.incident} disabled={!fadeIn} />
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
        <input id="same_address" type="checkbox" className="ml-2" checked={!fadeIn} onChange={handleChange} style={{marginTop:"-7px"}} />
      </span>
    : ""}
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
                tooltip="Address must be populated using the Address Search."
                disabled
              />
              {props.show_apt ?
                <TextInput
                  xs="2"
                  type="text"
                  label="Apartment"
                  name="apartment"
                  value={props.formikProps.values.apartment || ''}
                  disabled={!fadeIn}
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
                tooltip="City must be populated using the Address Search."
                disabled
              />
              <Col xs="2">
                <DropDown
                  label="State"
                  name="state"
                  id="state"
                  options={STATE_OPTIONS}
                  placeholder=''
                  tooltip="State must be populated using the Address Search."
                  disabled
                />
              </Col>
              <TextInput
                xs="2"
                type="text"
                label="Zip Code"
                name="zip_code"
                value={props.formikProps.values.zip_code || ''}
                tooltip="Zip Code must be populated using the Address Search."
                disabled
              />
            </Form.Row>
          </Col>
          <Col className="pl-0 pr-0 mb-3 mr-3" xs="4" style={{marginTop:"0px"}}>
            <Form.Label>Refine Exact Lat/Lon Point</Form.Label>
            <Map zoom={15} ref={mapRef} center={[initialLatLon[0] || props.formikProps.values.latitude || 0, initialLatLon[1] || props.formikProps.values.longitude || 0]} className="search-leaflet-container border rounded " >
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
    </>
  );
}

export { AddressLookup, AddressSearch, TextInput, Checkbox, DropDown, ImageUploader, DateTimePicker, DateRangePicker };
