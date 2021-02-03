import { useEffect } from "react";
import L from "leaflet";
import { useLeaflet } from "react-leaflet";

export const Legend = (props) => {
  const { map } = useLeaflet();

  useEffect(() => {
    const legend = L.control.scale(props);
    legend.addTo(map);
  }, [map]);
  return null;
};
