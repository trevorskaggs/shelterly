import { getBoundsFromPointAndRadius, convertKmToMeters } from "../utils/map";

function useMapUtils({ mapFitBounds }) {
  let bounds;

  function fitMapToPointAndRadius(point, radius) {
    bounds = getBoundsFromPointAndRadius(point, radius);
    if (typeof mapFitBounds === "function") {
      mapFitBounds(bounds);
    }
  }

  function calculateBoundingBox(latLngs) {
    console.log('🚀 ~ calculateBoundingBox ~ latLngs:', latLngs)
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    // Iterate through each coordinate pair to find min/max values
    for (let i = 0; i < latLngs.length; i++) {
        const lat = parseFloat(latLngs[i][0]);
        const lng = parseFloat(latLngs[i][1]);

        // Update min/max values
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
    }
    return {
      minLat: minLat,
      maxLat: maxLat,
      minLng: minLng,
      maxLng: maxLng
    };
  }

  return {
    bounds,
    convertKmToMeters,
    fitMapToPointAndRadius,
    calculateBoundingBox
  };
}

export default useMapUtils;
