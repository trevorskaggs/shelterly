import React, { useState, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import Select, { createFilter } from 'react-select';
import SimpleValue from 'react-select-simple-value';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useField } from 'formik';

const customStyles = {
  // For the select it self, not the options of the select
  control: (styles, { isDisabled }) => {
    return {
      ...styles,
      color: '#FFF',
      cursor: isDisabled ? 'not-allowed' : 'default',
      backgroundColor: isDisabled ? '#DFDDDD' : 'white',
      height: 35,
      minHeight: 35,
    };
  },
  option: (provided) => ({
    ...provided,
    color: 'black',
  }),
  singleValue: (styles, { isDisabled }) => ({
    ...styles,
    color: isDisabled ? '#595959' : 'black',
  }),
};

const CustomSelect = ({
  label,
  optionsKey = '',
  options,
  otherKey = 'other',
  value,
  handleValueChange,
  disabled,
  ref,
  filterConfig,
  selectId,
  selectName,
  textInputId,
  textInputName,
  formValidationName
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [customText, setCustomText] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [, textInputMeta] = useField(formValidationName);
  const selectRef = useRef();

  const textInputWrapperStyles = {
    position: 'relative',
    width: '100%',
  };
  const textInputStyles = {
    color: '#000',
    cursor: disabled ? 'not-allowed' : 'default',
    backgroundColor: disabled ? '#DFDDDD' : 'white',
    height: 35,
    minHeight: 35,
    borderColor: 'hsl(0,0%,80%)',
    borderRadius: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    width: '100%'
  };
  const textInputClearStyles = {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: 'sl(0, 0%, 60%)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    height: 35,
    minHeight: 35,
    width: 35,
    borderRadius: 4,
  };

  const changeValueHandler = (value) => {
    if (typeof handleValueChange === 'function') {
      handleValueChange(value);
    }
  };

  const handleSelectChange = (event) => {
    if (!event) {
      handleClear();
      return;
    }
    const selectedValue = event.value;
    setSelectedOption(selectedValue);
    if (selectedValue === otherKey) {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
    }
    changeValueHandler(selectedValue);
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    setCustomText(value);
    changeValueHandler(value);
  };

  const handleClear = () => {
    setSelectedOption('');
    setCustomText('');
    setIsOtherSelected(false);
    changeValueHandler('');
  };

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    console.log('🚀 ~ useEffect ~ value:', value)
    console.log('🚀 ~ useEffect ~ options:', options)
    console.log('🚀 ~ useEffect ~ selectedOption:', selectedOption)
    const valueIsOther =
      value && value === otherKey;
    const valueIsSelectable = selectedOption && !valueIsOther;
    const valueIsCustomText = value && !valueIsOther && !valueIsSelectable;
    console.log('🚀 ~ useEffect ~ valueIsOther:', valueIsOther)
    setIsOtherSelected(valueIsOther || valueIsCustomText);
    setCustomText(valueIsCustomText ? value : '');
    setSelectedOption(
      options.find((option) => option.value === value)?.value || ''
    );
  }, [value, options, otherKey]);

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ selectedOption:', selectedOption)
    if (selectRef.current) {
      console.log('🚀 ~ useEffect ~ electRef.current:', selectRef.current)
      selectRef.current.select.setValue(selectedOption);
    }
  }, [selectedOption]);

  return (
    <div>
      {label ? <Form.Label>{label}</Form.Label> : ""}
      <div>
        {isOtherSelected ? (
          <div style={{ ...textInputWrapperStyles }}>
            <input
              id={textInputId}
              name={textInputName}
              type="text"
              value={customText}
              onChange={handleInputChange}
              placeholder="Enter custom text"
              disabled={disabled}
              style={{
                ...textInputStyles
              }}
            />
            {!disabled && (
              <button onClick={handleClear} style={{ ...textInputClearStyles }}>
                <FontAwesomeIcon icon={faTimes} style={{cursor:'pointer'}} className="ml-1" size="sm" />
              </button>
            )}
          </div>
        ) : (
          <>
            <SimpleValue options={options}>
              {(simpleProps) => (
                <Select
                  id={selectId}
                  name={selectName}
                  isDisabled={disabled}
                  ref={selectRef}
                  styles={customStyles}
                  isClearable={true}
                  filterOption={createFilter(filterConfig)}
                  onChange={handleSelectChange}
                  {...simpleProps}
                />
              )}
            </SimpleValue>
          </>
        )}
      </div>
      {textInputMeta.error ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{textInputMeta.error}</div> : ""}
    </div>
  );
};

export default CustomSelect;
