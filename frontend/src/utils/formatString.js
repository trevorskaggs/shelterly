/**
 * capitalizes the first character of the first word, or all words in a string
 * @param  {string} stringToCapitalize
 * @param  {object} [options] - optional configuration options
 * @param  {boolean} [options.proper] - proper noun capitalization if true
 */
export function capitalize(stringToCapitalize, {
  proper = false
} = {}) {
  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  if (proper) {
    const words = stringToCapitalize.split(' ');
    for(let i = 0; i < words.length; i++) {
      words[i] = capitalizeWord(words[i])
    }

    return words.join(' ');
  }

  return capitalizeWord(stringToCapitalize);
}

export const statusLabelLookup = {
  'REPORTED': 'Reported',
  'REPORTED (EVAC REQUESTED)': 'Reported (Evac Requested)',
  'REPORTED (SIP REQUESTED)': 'Reported (SIP Requested)',
  'SHELTERED': 'Sheltered',
  'SHELTERED IN PLACE': 'Sheltered In Place (SIP)',
  'UNABLE TO LOCATE': 'Unable To Locate (UTL)',
  'NO FURTHER ACTION': 'No Further Action (NFA)',
  'REUNITED': 'Reunited',
  'DECEASED': 'Deceased',
};
