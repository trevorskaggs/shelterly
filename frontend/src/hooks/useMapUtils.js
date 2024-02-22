import { getBoundsFromPointAndRadius, convertKmToMeters } from "../utils/map";

function useMapUtils({ mapFitBounds }) {
  let bounds;

  function fitMapToPointAndRadius(point, radius) {
    bounds = getBoundsFromPointAndRadius(point, radius);
    if (typeof mapFitBounds === "function") {
      mapFitBounds(bounds);
    }
  }

  return {
    bounds,
    convertKmToMeters,
    fitMapToPointAndRadius,
  };
}

export default useMapUtils;
