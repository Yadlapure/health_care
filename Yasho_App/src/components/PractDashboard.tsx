import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { FaCheck, FaClock } from "react-icons/fa";
import { formatDate } from "../utils/formatDate";

const PractDashboard = ({ visit, onClick }) => {
  const getStatusInfo = () => {
    switch (visit.status) {
      case "INITIATED":
        return {
          icon: <FaClock className="h-6 w-6 text-healthcare-warning" />,
          title: "Pending",
          description: "Visit not yet started",
          color: "bg-healthcare-warning/20 text-healthcare-warning",
        };
      case "CHECKEDOUT":
        return {
          icon: <FaCheck className="h-6 w-6 text-healthcare-success" />,
          title: "Visit Complete",
          description: visit.checkOut
            ? formatDate(visit?.checkOut)
            : "Time not recorded",
          color: "bg-healthcare-danger/20 text-healthcare-gray",
        };
      default:
        return {
          icon: <FaClock className="h-6 w-6 text-healthcare-gray" />,
          title: "Unknown Status",
          description: "Status information unavailable",
          color: "bg-healthcare-gray/20 text-healthcare-gray",
        };
    }
  };

  const info = getStatusInfo();

  return (
    <Card
      className="mb-4 mt-4 bg-white border-healthcare-lightGray"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h1 className="mb-2">Client: {visit.assigned_client}</h1>
        <div className="flex items-center">
          <div className="mr-3">{info.icon}</div>
          <div>
            <h3 className="font-medium">{info.title}</h3>
            <p className="text-sm text-healthcare-gray">{info.description}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-sm px-2 py-1 rounded-full ${info.color}`}>
              {visit.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PractDashboard;
