import { Geolocation } from "@capacitor/geolocation";

export class GeolocationService {
  static async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      throw new Error("Failed to get current location");
    }
  }

  static calculateDistance(point1, point2): number {
    // Haversine formula to calculate distance between two points in meters
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters

    const φ1 = toRad(point1.latitude);
    const φ2 = toRad(point2.latitude);
    const Δφ = toRad(point2.latitude - point1.latitude);
    const Δλ = toRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  static isWithinRange(
    userLocation,
    targetLocation,
    range: number = 200
  ): boolean {
    const distance = this.calculateDistance(userLocation, targetLocation);
    return distance <= range;
  }
}
