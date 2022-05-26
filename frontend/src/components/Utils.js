import { capitalize } from '../utils/formatString';

export function titleCase(str) {
    return capitalize(str, { proper: true });
};