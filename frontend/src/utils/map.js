import {
  buffer as turfBuffer,
  point as turfPoint,
  bbox as turfBBox,
} from "@turf/turf";

function getBoundsFromPointAndRadius(point, radius) {
  const buffered = turfBuffer(turfPoint(point), radius, { units: 'meters' });
  const bbox = turfBBox(buffered);
  const bounds = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ];
  return bounds;
}

function convertKmToMeters(radiusKm, paddingM = 0) {
  return radiusKm * 1000 + paddingM;
}

export { getBoundsFromPointAndRadius, convertKmToMeters };
