import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionsDropdown = ({
  className = '',
  children,
  id = 'actions-dropdown',
  size = 'sm',
  title = 'Actions',
  variant = 'dark',
  search = false,
  disabled = false
}) => {
  return (
    <Dropdown size={size} alignRight={true} className={className} style={{paddingTop: search ? "" : "5px", height: search ? '36px' : '39px'}}>
      <Dropdown.Toggle className={search ? 'border rounded ' : ''} variant={search ? '' : variant} id={id} disabled={disabled}>
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {React.Children.map(children, (child, index) => (
          <Dropdown.Item key={index} as="div" className="pt-0 pb-0 pl-0 pr-3">
            {child}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionsDropdown;