import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { GeolocationService } from "../services/geolocation.service";
import { FaMapMarkerAlt } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

// Fix the icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationMap = ({
  patientLocation,
  userLocation,
  onLocationCapture,
  disabled = false,
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWithinRange, setIsWithinRange] = useState(true);

  // Center the map on patient location or current location if available
  const mapCenter = currentLocation || patientLocation;

  // Update current location
  const updateCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await GeolocationService.getCurrentPosition(); 
           
      setCurrentLocation(location);

      // Check if within range
      const withinRange = GeolocationService.isWithinRange(
        location,
        patientLocation,
        200
      );

      setIsWithinRange(withinRange);

      if (!withinRange) {
        toast.error("You are not within 200 meters of the patient location.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Failed to get your current location.");
    } finally {
      setLoading(false);
    }
  };

  // Handle location capture
  const handleCaptureLocation = () => {
    if (currentLocation && isWithinRange) {
      onLocationCapture(currentLocation);
      toast.success("Location captured successfully.");
    } else if (currentLocation && !isWithinRange) {
      toast.error("You must be within 200 meters of the patient location.");
    } else {
      toast.error("Current location not available.");
    }
  };

  // Get initial location on mount
  useEffect(() => {
    if (!userLocation) {
      updateCurrentLocation();
    } else {
      setCurrentLocation(userLocation);
      setIsWithinRange(
        GeolocationService.isWithinRange(userLocation, patientLocation, 200)
      );
    }
  }, [userLocation, patientLocation]);

  return (
    <Card className="mb-4">
      <CardHeader className="bg-healthcare-lightGray py-3 px-4">
        <CardTitle className="text-lg flex justify-between">
          <span>Patient Location</span>
          {currentLocation && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isWithinRange
                  ? "bg-healthcare-success/20 text-healthcare-success"
                  : "bg-healthcare-danger/20 text-healthcare-danger"
              }`}
            >
              {isWithinRange ? "In Range" : "Out of Range"}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[250px] w-full">
          <MapContainer
            center={[mapCenter.latitude, mapCenter.longitude]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Patient location marker */}
            <Marker
              position={[patientLocation.latitude, patientLocation.longitude]}
            />

            {/* 200m radius circle around patient location */}
            <Circle
              center={[patientLocation.latitude, patientLocation.longitude]}
              radius={200}
              pathOptions={{
                color: "blue",
                fillColor: "blue",
                fillOpacity: 0.1,
              }}
            />

            {/* Current location marker */}
            {currentLocation && (
              <Marker
                position={[currentLocation.latitude, currentLocation.longitude]}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                    shadowUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
              />
            )}
          </MapContainer>
        </div>

        <div className="p-4 space-y-2">
          {/* <Button
            onClick={updateCurrentLocation}
            variant="outline"
            className="w-full flex items-center justify-center"
            disabled={loading || disabled}
          >
            <FaMapMarkerAlt className="mr-2 h-4 w-4" />
            {loading ? "Getting Location..." : "Update My Location"}
          </Button> */}

          <Button
            onClick={handleCaptureLocation}
            className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
            disabled={!currentLocation || !isWithinRange || loading || disabled}
          >
            Capture Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
