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
