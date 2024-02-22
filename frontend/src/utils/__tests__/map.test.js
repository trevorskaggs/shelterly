import {
  buffer as turfBuffer,
  point as turfPoint,
  bbox as turfBBox,
} from '@turf/turf';
import { getBoundsFromPointAndRadius, convertKmToMeters } from '../map';

jest.mock('@turf/turf');

describe('Utils > map', () => {
  describe('getBoundsFromPointAndRadius', () => {
    const mockBuffer = 1;
    const mockProvidedPoint = [0, 1];
    const mockTurfPoint = {
      type: 'Feature',
      geometry: { coordinates: mockProvidedPoint },
    };
    const mockBBox = [0, 1, 2, 3];
    const mockRadius = 999;

    beforeEach(() => {
      turfBuffer.mockClear();
      turfPoint.mockClear();
      turfBBox.mockClear();
      turfBuffer.mockReturnValue(mockBuffer);
      turfPoint.mockReturnValue(mockTurfPoint);
      turfBBox.mockReturnValue(mockBBox);
    });

    it('calls turf functions, returns bounds', () => {
      const bounds = getBoundsFromPointAndRadius(mockProvidedPoint, mockRadius);

      expect(turfPoint).toHaveBeenCalledTimes(1);
      expect(turfPoint).toHaveBeenCalledWith(mockProvidedPoint);
      expect(turfBuffer).toHaveBeenCalledTimes(1);
      expect(turfBuffer.mock.calls[0][0]).toBe(mockTurfPoint);
      expect(turfBuffer.mock.calls[0][1]).toBe(mockRadius);
      expect(turfBBox).toHaveBeenCalledTimes(1);
      expect(turfBBox).toHaveBeenCalledWith(1);
      expect(bounds).toEqual([
        [mockBBox[0], mockBBox[1]],
        [mockBBox[2], mockBBox[3]],
      ]);
    });
  });

  describe('convertKmToMeters', () => {
    it('converts provided kilometers to meters', () => {
      const km = 999;
      const expectedMeters = 999000;
      expect(convertKmToMeters(km)).toBe(expectedMeters);
    });

    it('converts provided kilometers to meters with added padding', () => {
      const km = 10;
      const paddingM = 999;
      const expectedMeters = 10999;
      expect(convertKmToMeters(km, paddingM)).toBe(expectedMeters);
    });
  });
});
