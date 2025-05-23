import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { CameraService } from "../services/camera.service";
import { toast } from "react-toastify";
import { FaCamera, FaTimes } from "react-icons/fa";


const defaultVitals = {
  bloodPressure: "",
  sugar: "",
  notes: "",
  // prescription_images:[]
};

const VitalsForm = ({
  initialVitals = defaultVitals,
  onSave,
  disabled = false,
  initialImage,
  initialPrescription,
}) => {
  const [vitals, setVitals] = useState(initialVitals);
  // const [prescription, setPrescription] = useState(initialPrescription);
  // const [prescriptionImage, setPrescriptionImage] = useState<
  //   string | undefined
  // >(initialImage);
  // const [loading, setLoading] = useState(false);

  // const handleCapturePrescriptionImage = async () => {
  //   try {
  //     setLoading(true);
  //     const imageData = await CameraService.takeSelfie();
  //     setPrescriptionImage(imageData);
  //     toast.success("Prescription image captured successfully!");
  //   } catch (error) {
  //     console.error("Error capturing image:", error);
  //     toast.error("Failed to capture image. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleRemoveImage = () => {
  //   setPrescriptionImage(undefined);
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(vitals);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="bg-healthcare-lightGray py-3 px-4">
        <CardTitle className="text-lg">Patient Vitals</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bloodPressure"
                className="block text-sm font-medium mb-1"
              >
                Blood Pressure
              </label>
              <Input
                id="bloodPressure"
                name="bloodPressure"
                placeholder="e.g., 120/80 mmHg"
                value={vitals.bloodPressure}
                onChange={handleChange}
                disabled={disabled}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="sugar"
                className="block text-sm font-medium mb-1"
              >
                Blood Sugar (mg/dL)
              </label>
              <Input
                id="sugar"
                name="Sugar"
                placeholder="e.g., 100 mg/dL"
                value={vitals.sugar}
                onChange={handleChange}
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* <div>
              <label
                htmlFor="heartRate"
                className="block text-sm font-medium mb-1"
              >
                Heart Rate (BPM)
              </label>
              <Input
                id="heartRate"
                name="heartRate"
                placeholder="e.g., 72 BPM"
                value={vitals.heartRate}
                onChange={handleChange}
                disabled={disabled}
                className="w-full"
              />
            </div> */}

            {/* <div>
              <label
                htmlFor="oxygenSaturation"
                className="block text-sm font-medium mb-1"
              >
                Oxygen Saturation (%)
              </label>
              <Input
                id="oxygenSaturation"
                name="oxygenSaturation"
                placeholder="e.g., 98%"
                value={vitals.oxygenSaturation}
                onChange={handleChange}
                disabled={disabled}
                className="w-full"
              />
            </div> */}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any observations or concerns..."
                value={vitals.notes}
                onChange={handleChange}
                disabled={disabled}
                className="w-full min-h-[100px]"
                required
              />
            </div>
            {/* <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="block">Prescription Image</Label>
                    {prescriptionImage ? (
                      <div className="relative">
                        <img
                          src={prescriptionImage}
                          alt="Prescription"
                          className="w-full h-[200px] object-cover rounded-md"
                        />
                        {!disabled && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-8 h-8"
                            onClick={handleRemoveImage}
                          >
                            <FaTimes className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={handleCapturePrescriptionImage}
                        className="w-full hover:bg-healthcare-primary/90 h-[100px] flex flex-col items-center justify-center"
                        disabled={loading || disabled}
                      >
                        <FaCamera className="h-6 w-6 mb-2" />
                        {loading
                          ? "Capturing..."
                          : "Capture Prescription Image"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {!disabled && (
              <Button
                type="submit"
                className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
              >
                Save
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VitalsForm;
