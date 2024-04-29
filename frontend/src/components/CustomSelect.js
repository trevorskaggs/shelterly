import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Select, { createFilter } from 'react-select';
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
  options,
  otherKey = 'other',
  value,
  handleValueChange,
  disabled,
  filterConfig,
  selectId,
  selectName,
  textInputId,
  textInputName,
  formValidationName
}) => {
  console.log('🚀 ~ label:', label)
  const [selectedOption, setSelectedOption] = useState('');
  const [customText, setCustomText] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [, textInputMeta] = useField(formValidationName);

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
    width: '100%',
    paddingLeft: '0.5rem'
  };
  const textInputClearStyles = {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#C6C6C6',
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
    const optionValue = options.find((option) => option.value === value);
    const valueIsOther =
      value && value === otherKey;
    const valueIsSelectable = optionValue && !valueIsOther;
    const valueIsCustomText = value && !valueIsOther && !valueIsSelectable;
    setIsOtherSelected(valueIsOther || valueIsCustomText);
    setCustomText(valueIsCustomText ? value : '');
    setSelectedOption(
      optionValue || ''
    );
  }, [value, options, otherKey]);

  return (
    <div className="shelterly-custom-select">
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
              <button onClick={handleClear} className="btn-clear-text-input" style={{ ...textInputClearStyles }}>
                <FontAwesomeIcon icon={faTimes} style={{cursor:'pointer'}} className="ml-1" size="sm" />
              </button>
            )}
          </div>
        ) : (
          <>
            <Select
              id={selectId}
              name={selectName}
              isDisabled={disabled}
              styles={customStyles}
              isClearable={true}
              filterOption={createFilter(filterConfig)}
              onChange={handleSelectChange}
              value={selectedOption}
              options={options}
            />
          </>
        )}
      </div>
      {textInputMeta.error ? <div style={{ color: "#e74c3c", marginTop: ".5rem", fontSize: "80%" }}>{textInputMeta.error}</div> : ""}
    </div>
  );
};

export default CustomSelect;
