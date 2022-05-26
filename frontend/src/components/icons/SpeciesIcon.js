import React from 'react';
import PropTypes from 'prop-types';
import {
  ShelterlyIcon,
  ShCat,
  ShDog,
  ShHorse,
  ShPaw,
  ShLogo
} from './index';

/**
 * Shelterly Icon - Species Icon
 * @param  {object} [iconProps]
 * @param  {string} [iconProps.species="other"] - species type, e.g. dog, cat, horse, other. defaults to other.
 * @param  {string} [iconProps.color="#000"] - fill color
 * @param  {string} [iconProps.srLabel="Other Species Icon"] - label for screen readers, if not provided, defaults per species icon will be used
 */
const SpeciesIcon = ({
  species = 'other',
  ...iconProps
}) => {
  let iconSpecies = ShPaw;
  let srLabel = iconProps

  switch (species) {
    case 'cat': {
        iconSpecies = ShCat;
        srLabel = 'Cat Species Icon';
        break;
    }
    case 'dog': {
      iconSpecies = ShDog;
      srLabel = 'Dog Species Icon';
      break;
    }
    case 'horse': {
      iconSpecies = ShHorse;
      srLabel = 'Horse Species Icon';
      break;
    }
    default: {
      iconSpecies = ShLogo
      srLabel = 'Other Species Icon';
      break;
    }
  }

  return <ShelterlyIcon {...iconProps} icon={iconSpecies} srLabel={iconProps.srLabel || srLabel} />
};

SpeciesIcon.propTypes = {
  species: PropTypes.string
};

export default SpeciesIcon;
