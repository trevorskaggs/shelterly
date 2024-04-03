import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Select, { createFilter } from "react-select";
import SimpleValue from "react-select-simple-value";

const CustomSelect = ({ label, options, value, handleValueChange }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [customText, setCustomText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isInit, setIsInit] = useState(true);

  const changeValueHandler = (value) => {
    setIsInit(false);
    if (typeof handleValueChange === "function") {
      handleValueChange(value);
    }
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    if (selectedValue === "other") {
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
    setSelectedOption("");
    setCustomText("");
    setIsOtherSelected(false);
    changeValueHandler("");
  };

  useEffect(() => {
    console.log("🚀 ~ value:", value);
    console.log("🚀 ~ useEffect ~ options:", options);
    if (!isInit) return;
    const valueIsOther = !options.find((option) => option.value === value);
    setIsOtherSelected(valueIsOther);
    setCustomText(valueIsOther ? value : "");
    setSelectedOption(
      options.find((option) => option.value === value)?.value || ""
    );
  }, [value, options, isInit]);

  return (
    <div>
      {label ? <Form.Label>{label}</Form.Label> : ""}
      <div>
        {isOtherSelected ? (
          <input
            type="text"
            value={customText}
            onChange={handleInputChange}
            placeholder="Enter custom text"
          />
        ) : (
          <>
            <SimpleValue options={options}>
              {(simpleProps) => (
                <Select
                  isDisabled={props.disabled}
                  ref={ref}
                  styles={customStyles}
                  isClearable={true}
                  filterOption={createFilter(filterConfig)}
                  onChange={handleOptionChange}
                  {...props}
                  {...simpleProps}
                />
              )}
            </SimpleValue>
            <select value={selectedOption} onChange={handleSelectChange}>
              <option value="" disabled hidden>
                Select an option
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}
        {isOtherSelected && <button onClick={handleClear}>Clear</button>}
      </div>
    </div>
  );
};

export default CustomSelect;
