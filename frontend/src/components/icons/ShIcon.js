import React from 'react';
import PropTypes from 'prop-types';
import { ShLogo } from '.';

/**
 * Shelterly Icon
 * @param  {string} [color="#000"] - fill color
 * @param  {React.Component} [icon=shLogo] - shIcon component
 * @param  {string} [srLabel="Shelterly Icon"] - label for screen readers
 */
const ShelterlyIcon = ({
  color = '#000',
  icon = ShLogo,
  srLabel = 'Shelterly Icon'
}) => {
  const Icon = icon;
  return (
    <Icon fill={color} width="100%" height="auto" role="img" aria-label={srLabel} />
  )
};

ShelterlyIcon.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.object,
  srTitle: PropTypes.string
}

export default ShelterlyIcon;
