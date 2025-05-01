export const ITEMS_PER_PAGE = 1;

export const STATE_OPTIONS = [
  { value: '', label: ''},
  // US
  { value: 'AL', label: 'AL' }, { value: 'AK', label: 'AK' }, { value: 'AZ', label: 'AZ' }, { value: 'AR', label: 'AR' }, { value: 'CA', label: 'CA' }, { value: 'CO', label: 'CO' }, { value: 'CT', label: 'CT' },
  { value: 'DE', label: 'DE' }, { value: 'FL', label: 'FL' }, { value: 'GA', label: 'GA' }, { value: 'HI', label: 'HI' }, { value: 'ID', label: 'ID' }, { value: 'IL', label: 'IL' }, { value: 'IN', label: 'IN' },
  { value: 'IA', label: 'IA' }, { value: 'KS', label: 'KS' }, { value: 'KY', label: 'KY' }, { value: 'LA', label: 'LA' }, { value: 'ME', label: 'ME' }, { value: 'MD', label: 'MD' }, { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' }, { value: 'MN', label: 'MN' }, { value: 'MS', label: 'MS' }, { value: 'MO', label: 'MO' }, { value: 'MT', label: 'MT' }, { value: 'NE', label: 'NE' }, { value: 'NV', label: 'NV' },
  { value: 'NH', label: 'NH' }, { value: 'NJ', label: 'NJ' }, { value: 'NM', label: 'NM' }, { value: 'NY', label: 'NY' }, { value: 'NC', label: 'NC' }, { value: 'ND', label: 'ND' }, { value: 'OH', label: 'OH' },
  { value: 'OK', label: 'OK' }, { value: 'OR', label: 'OR' }, { value: 'PA', label: 'PA' }, { value: 'RI', label: 'RI' }, { value: 'SC', label: 'SC' }, { value: 'SD', label: 'SD' }, { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' }, { value: 'VA', label: 'VA' }, { value: 'VT', label: 'VT' }, { value: 'WA', label: 'WA' }, { value: 'WV', label: 'WV' }, { value: 'WI', label: 'WI' }, { value: 'WY', label: 'WY' },
  // Canada
  { value: 'AB', label: 'AB' }, { value: 'BC', label: 'BC' }, { value: 'MB', label: 'MB' }, { value: 'NB', label: 'NB' }, { value: 'NL', label: 'NL' }, { value: 'NS', label: 'NS' }, { value: 'NT', label: 'NT' },
  { value: 'NU', label: 'NU' }, { value: 'ON', label: 'ON' }, { value: 'PE', label: 'PE' }, { value: 'QC', label: 'QC' }, { value: 'SK', label: 'SK' }, { value: 'YT', label: 'YT' }
]

export const priorityChoices = [
  { value: 1, label: 'Urgent' },
  { value: 2, label: 'High' },
  { value: 4, label: 'Low' },
];

export const DATE_FORMAT = 'YYYYMMDDHHmm';

export const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif'];

export const FILE_TYPES = ['pdf']

export const ACCEPT_FILE_TYPES = [
  ...IMAGE_TYPES,
  ...FILE_TYPES
];

export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};
