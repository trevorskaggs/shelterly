import QRious from 'qrious';

function createQrCode(value, {
  asDataURL = true,
  mimeType = 'image/jpeg'
} = {}) {
  const qrCode = new QRious({ value });

  if (asDataURL) {
    return qrCode.toDataURL(mimeType);
  }
  return qrCode;
}

export { createQrCode };
