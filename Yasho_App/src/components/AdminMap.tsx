import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import { useMap } from "react-leaflet";
import "leaflet-geosearch/dist/geosearch.css";
import { Button } from "./ui/button";

const SearchControl = ({ setPosition }) => {
  const map = useMap();

  React.useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      retainZoomLevel: false,
      showMarker: true,
      showPopup: false,
      maxMarkers: 1,
      marker: {
        draggable: false,
      },
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result) => {
      const { location } = result;
      if (location && setPosition) {
        setPosition({ lat: location.y, lng: location.x });
      }
    });

    return () => map.removeControl(searchControl);
  }, [map, setPosition]);

  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const AdminMap = ({ initialPosition, onConfirm, onCancel }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const center = initialPosition || { lat: 12.9716, lng: 77.5946 };

  return (
    <div>
      <MapContainer
        center={position || center}
        zoom={19}
        style={{ height: "400px", width: "600px" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl setPosition={setPosition} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <div className="mt-2 flex justify-end space-x-2">
        <Button
          variant="outline"
          className="btn btn-outline"
          onClick={() => onCancel && onCancel()}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          className="btn btn-primary"
          onClick={() => {
            if (position) onConfirm(position);
            else alert("Please pick a location on the map first.");
          }}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default AdminMap;
