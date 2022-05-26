import React from 'react';
import PropTypes from 'prop-types';
import { SpeciesIcon } from './icons';
/**
 * renders animal photo or default animal icon
 * @param  {string} [altText='AnimalCoverImage'] - alt text or aria-label text for accessibility
 * @param  {string} [animalImageSrc] - image src reference, if null or undefined a default based on species will render
 * @param  {string} [animalSpecies='other'] - adding a species name might give a special default icon
 * @param  {string} [backgroundColor='#F3F4F6'] - background color only visible if animalImageSrc supports transparency, or is undefined
 * @param  {string} [color='#B9BECA'] - fill color of the icon, only used if animalImageSrc s not defined
 * @param  {object} [customStyles={}] - javascript inline styles
 * @param  {string} [height='206px']
 * @param  {string} [width='206px']
 */
const AnimalCoverImage = ({
  altText = 'Animal Cover Image',
  animalImageSrc,
  animalSpecies = 'other',
  backgroundColor = '#F3F4F6',
  color = '#B9BECA',
  customStyles = {},
  height = '206px',
  width = '206px'
}) => {
  const CoverImage = ({
    as = 'img',
    src,
    ...props
  }) => {
    const Component = as;
    return (
      <Component
        alt={altText}
        style={{
          width,
          height,
          objectFit: 'cover',
          overflow: 'hidden',
          backgroundColor,
          ...customStyles
        }}
        src={src}
      >
        {props.children}
      </Component>
    );
}

  if (animalImageSrc) {
    return (
      <CoverImage src={animalImageSrc} />
    )
  }

  return (
    <CoverImage as="div" alt={altText}>
      <SpeciesIcon color={color} species={animalSpecies} srLabel={altText} />
    </CoverImage>
  )
}

AnimalCoverImage.propTypes = {
  altText: PropTypes.string,
  animalImageSrc: PropTypes.string,
  animalSpecies: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  customStyles: PropTypes.object,
  height: PropTypes.string,
  width: PropTypes.string
}

export default AnimalCoverImage;
