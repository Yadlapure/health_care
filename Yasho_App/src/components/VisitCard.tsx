import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";

import {
  FaCalendarAlt,
  FaUserMd,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import visits from "../api/visits/visits";
import { formatDate } from "../utils/formatDate";

interface VisitCardProps {
  visit: any;
  practitionerName: string;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit, practitionerName }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (showDetails && visit.vitals?.prescription_images?.length > 0) {
        const result = await visits.getImageURL(
          visit.vitals.prescription_images,
        );

        if (result?.data) {
          const urls = result.data.map((obj: any) => Object.values(obj)[0]);
          setImageUrls(urls);
        }
      }
    };
 
    fetchImageUrls();
  }, [showDetails, visit.vitals?.prescription_images]);
  
  const getStatusColor = () => {
    switch (visit.status) {
      case "INITIATED":
        return "bg-yellow-200 text-black-800";
      case "CHECKEDIN":
        return "bg-green-200 text-black-800";
      case "CHECKEDOUT":
        return "bg-red-200 text-black-800";
      default:
        return "bg-gray-100 text-black-800";
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <FaCalendarAlt className="h-3 w-3 mr-1" />
                <span>{formatDate(visit.checkIn)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <FaUserMd className="h-3 w-3 mr-1" />
                <span>{practitionerName}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}
              >
                {visit.status}
              </span>

              {visit.status === "CHECKEDOUT" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => setShowDetails(true)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md bg-[#fff]">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Checkin</h3>
              <p>{formatDate(visit.checkIn)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Checkout</h3>
              <p>{formatDate(visit.checkOut)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Practitioner
              </h3>
              <p>{practitionerName}</p>
            </div>

            {visit.vitals && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <FaUserMd className="mr-1" /> Vitals
                </h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p>{visit.vitals.bloodPressure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p>{visit.vitals.heartRate} BPM</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Blood Sugar</p>
                    <p>{visit.vitals.sugar} mg/dL</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Oxygen Saturation</p>
                    <p>{visit.vitals.oxygenSaturation}%</p>
                  </div>
                </div>
                {visit.vitals.notes && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{visit.vitals.notes}</p>
                  </div>
                )}
              </div>
            )}

            {imageUrls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <FaPrescriptionBottleAlt className="mr-1" /> Prescription
                </h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Prescription ${index + 1}`}
                      className="border rounded max-h-40 object-contain"
                      width={150}
                      height={150}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisitCard;
