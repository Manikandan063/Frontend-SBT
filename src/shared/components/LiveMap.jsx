import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { googleMapsApiKey, libraries, region } from "../../config/googleMapsConfig";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 11.0183,
  lng: 77.0054,
};

export default function LiveMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    region,
    libraries
  });

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}