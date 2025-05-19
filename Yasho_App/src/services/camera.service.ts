import {
  Camera,
  CameraResultType,
  CameraSource,
  CameraDirection,
} from "@capacitor/camera";

export class CameraService {
  static async takeSelfie(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Front,
      });

      return image.dataUrl || "";
    } catch (error) {
      console.error("Error taking photo:", error);
      throw new Error("Failed to take photo");
    }
  }
}
