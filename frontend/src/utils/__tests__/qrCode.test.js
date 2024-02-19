import QRious from 'qrious';
import { createQrCode } from '../qrCode';

jest.mock('qrious');

describe('Utils > qrCode', () => {
  beforeEach(() => {
    QRious.mockClear();
  });

  it('calls an instance of QRious', () => {
    const value = 'test value';
    const mimeType = 'test/mime';
    createQrCode(value, { mimeType });

    // mock instance
    const mockQriousInstance = QRious.mock.instances[0];
    const mockToDataURL = mockQriousInstance.toDataURL;

    // expectations
    expect(QRious).toHaveBeenCalledTimes(1);
    expect(QRious).toHaveBeenCalledWith({ value });
    expect(mockToDataURL).toHaveBeenCalledTimes(1);
    expect(mockToDataURL).toHaveBeenCalledWith(mimeType);
  })
})