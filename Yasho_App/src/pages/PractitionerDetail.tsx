import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import VisitStatusCard from "../components/VisitStatusCard";
import LocationMap from "../components/LocationMap";
import SelfieCapture from "../components/SelfieCapture";
import VitalsForm from "../components/VitalsForm";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FaClock, FaUserAlt, FaStethoscope, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import visits from "../api/visits/visits";
import { base64ToFile } from "../utils/base64ToFile";
import PractDashboard from "../components/PractDashboard";


const PractitionerDetail = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inLocationCaptured, setInLocationCaptured] = useState(false);
  const [outLocationCaptured, setOutLocationCaptured] = useState(false);
  const [inSelfieCaptured, setInSelfieCaptured] = useState(false);
  const [outSelfieCaptured, setOutSelfieCaptured] = useState(false);
  const [vitalsCaptured, setVitalsCaptured] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [endVisitDialogOpen, setEndVisitDialogOpen] = useState(false);
  const [capturedInLocation, setCapturedInLocation] = useState(null);
  const [capturedInSelfie, setCapturedInSelfie] = useState(null);
  const [capturedOutLocation, setCapturedOutLocation] = useState(null);
  const [capturedOutSelfie, setCapturedOutSelfie] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const [activeTab, setActiveTab] = useState("INITIATED");

  // Load visit data
  useEffect(() => {
    const loadVisitData = async () => {
      try {
        setLoading(true);

        const visitData = await visits.getVisits();
        if (visitData.status_code !== 0) {
          toast.error(visitData.error);
          return;
        }

        const firstVisit = visitData.data[0];
        setVisit(firstVisit);

        // Determine dashboard visibility
        const isInit = firstVisit.status === "INITIATED";
        const hasNotCapturedAnything =
          !firstVisit.inLocation && !firstVisit.inSelfie;

        if (isInit && hasNotCapturedAnything) {
          setShowDashboard(true); // Show dashboard card
        }

        // Continue as normal if data is already filled
        if (firstVisit.status === "CHECKEDIN") {
          setInLocationCaptured(true);
          setInSelfieCaptured(true);
        }

        if (firstVisit.status === "VITALUPDATE") {
          setOutLocationCaptured(false);
          setOutSelfieCaptured(false);
        }
        if (firstVisit.status === "CHECKEDOUT") {
          setShowDashboard(true);
        }

        // Default active tab logic
        setActiveTab(firstVisit.status);
      } catch (error) {
        console.error("Error loading visit:", error);
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadVisitData();
  }, []);

  // Handle location capture for check-in
  const handleInLocationCapture = (location) => {
    setCapturedInLocation(location);
  };

  // Handle selfie capture for check-in
  const handleInSelfieCapture = async (imageData: string) => {
    setCapturedInSelfie(imageData);

    if (!capturedInLocation) {
      toast.error("Location not captured yet");
      return;
    }

    try {
      const updatedVisit = {
        ...visit,
        inLocation: capturedInLocation,
        inSelfie: imageData,
      };

      setVisit(updatedVisit);
      setInLocationCaptured(true);
      setInSelfieCaptured(true);
    } catch (error) {
      console.error("Failed to save check-in data", error);
      toast.error("Failed to save check-in data");
    }
  };

  const handleCompleteCheckIn = async () => {
    if (!visit || !capturedInLocation || !capturedInSelfie) {
      toast.error("Missing required data");
      return;
    }

    try {
      const selfieFile = base64ToFile(capturedInSelfie);

      const formData = new FormData();
      formData.append("lat", capturedInLocation.latitude.toString());
      formData.append("lng", capturedInLocation.longitude.toString());
      formData.append("img", selfieFile);

      const response = await visits.updatecheckInOut(formData);
      if (response.status_code === 0) {
        setVisit(response.data);
        setActiveTab("CHECKEDIN");
        setInLocationCaptured(true);
        setInSelfieCaptured(true);
        toast.success("Check-in completed successfully!");
        setConfirmDialogOpen(false);
      } else {
        throw new Error("Failed to check in");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Failed to complete check-in");
    }
  };

  // Handle vitals capture
  const handleVitalsSave = async (vitals) => {
    if (!visit) return;

    try {
      const response = await visits.updateVitals(vitals);
      setVisit(response.data);
      setActiveTab("VITALUPDATE");
      setVitalsCaptured(true);

      toast.success("Patient vitals saved");
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast.error("Failed to save vitals");
    }
  };

  const handleOutLocationCapture = (location) => {
    setCapturedOutLocation(location);
    setOutLocationCaptured(true);
  };

  // Handle selfie capture for check-out
  const handleOutSelfieCapture = async (imageData: string) => {
    setCapturedOutSelfie(imageData);

    if (!capturedOutLocation) {
      toast.error("Location not captured yet");
      return;
    }

    try {
      const updatedVisit = {
        ...visit,
        outLocation: capturedOutLocation,
        outSelfie: imageData,
      };

      // await StorageService.saveVisit(updatedVisit);
      setVisit(updatedVisit);
      setOutLocationCaptured(true);
      setOutSelfieCaptured(true);
    } catch (error) {
      console.error("Failed to save check-in data", error);
      toast.error("Failed to save check-in data");
    }
  };

  // Handle check-out completion
  const handleCompleteCheckOut = async () => {
    if (!visit || !capturedOutLocation || !capturedOutSelfie) {
      toast.error("Missing required data");
      return;
    }

    try {
      const selfieFile = base64ToFile(capturedOutSelfie);
      const formData = new FormData();
      formData.append("lat", capturedOutLocation.latitude.toString());
      formData.append("lng", capturedOutLocation.longitude.toString());
      formData.append("img", selfieFile);

      const response = await visits.updatecheckInOut(formData);
      if (response.status_code === 0) {
        setVisit(response.data);
        setShowDashboard(true);
        toast.success("Check-out completed successfully!");
        setConfirmDialogOpen(false);
      } else {
        throw new Error("Failed to check out");
      }
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("Failed to complete check-out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header title="Visit Details" showBack={false} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading visit details...</div>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header
          title="Your Dashboard"
          showBack={false}
          rightContent={true}
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
        />
        <div className="p-4 text-center">
          <p className="mb-4">The requested visit could not be found.</p>
        </div>
      </div>
    );
  }

  // Check if check-in is ready
  const isCheckInReady =
    inLocationCaptured && inSelfieCaptured && visit.status === "INITIATED";

  // Check if check-out is ready
  const isCheckOutReady =
    visit.status === "VITALUPDATE" && outLocationCaptured && outSelfieCaptured;

  // Check visit status to show appropriate content
  const showCheckInContent = true;
  const showVitalsContent = visit.status === "CHECKEDIN";
  const showCheckOutContent = visit.status === "VITALUPDATE";
  const isVisitComplete = visit.status === "CHECKEDOUT";

  // Determine which tabs are enabled
  const isAssessmentTabEnabled =
    inLocationCaptured && inSelfieCaptured && visit.status === "INITIATED";
  const isCheckOutTabEnabled =
    isAssessmentTabEnabled &&
    vitalsCaptured &&
    (visit.status === "CHECKEDIN" || visit.status === "CHECKEDOUT");

  const handleTabChange = (value: string) => {
    // Only allow tab changes if the conditions are met
    if (value === "INITIATED") {
      toast.error("Already Checked-in");
      return;
    }
    if (value === "CHECKEDOUT" && !isCheckOutTabEnabled) {
      toast.error("Complete initiated first");
      return;
    }
    setActiveTab(value);
  };

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <Header
          title="Your Dashboard"
          showBack={false}
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
          rightContent={true}
        />
        <PractDashboard
          visit={visit}
          onClick={() =>
            visit.status === "INITIATED" && setShowDashboard(false)
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      <Header
        title={`YOUR VISIT`}
        showBack={visit.status === "INITIATED" ? true : false}
      />
      <div className="p-4 max-w-md mx-auto">
        <VisitStatusCard visit={visit} />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="INITIATED" className="flex items-center gap-1">
              <FaClock className="h-4 w-4" />
              <span className="hidden sm:inline">Check In</span>
            </TabsTrigger>
            <TabsTrigger
              value="CHECKEDIN"
              className="flex items-center gap-1"
              disabled={!isAssessmentTabEnabled}
            >
              <FaStethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Assessment</span>
            </TabsTrigger>
            <TabsTrigger
              value="CHECKEDOUT"
              className="flex items-center gap-1"
              disabled={!isCheckOutTabEnabled}
            >
              <FaFileAlt className="h-4 w-4" />
              <span className="hidden sm:inline">Check Out</span>
            </TabsTrigger>
          </TabsList>

          {/* Check In Tab */}
          <TabsContent value="INITIATED" className="mt-4">
            {showCheckInContent && (
              <div className="space-y-4">
                <LocationMap
                  // patientLocation={"patient.coordinates"}
                  // userLocation={visit.inLocation}
                  patientLocation={{
                    latitude: 12.8754709,
                    longitude: 77.6127866,
                  }}
                  userLocation={{ latitude: 12.8754709, longitude: 77.6127866 }}
                  onLocationCapture={handleInLocationCapture}
                  disabled={visit.status !== "INITIATED"}
                />

                {capturedInLocation && (
                  <SelfieCapture
                    title="Check-In Verification"
                    onCapture={handleInSelfieCapture}
                    disabled={visit.status !== "INITIATED"}
                  />
                )}

                {isCheckInReady && (
                  <Button
                    className="w-full bg-healthcare-success hover:bg-healthcare-success/90 py-6"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Complete Check In
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="CHECKEDIN" className="mt-4">
            {showVitalsContent && (
              <div className="space-y-4">
                <VitalsForm
                  initialVitals={visit.vitals}
                  onSave={handleVitalsSave}
                  disabled={isVisitComplete}
                  initialPrescription={visit.prescription}
                  initialImage={visit.prescriptionImage}
                />
              </div>
            )}
          </TabsContent>

          {/* Check Out Tab */}
          <TabsContent value="VITALUPDATE" className="mt-4">
            {showCheckOutContent && (
              <div className="space-y-4">
                <LocationMap
                  // patientLocation={patient.coordinates}
                  // userLocation={visit.outLocation}
                  patientLocation={{
                    latitude: 12.8754709,
                    longitude: 77.6127866,
                  }}
                  userLocation={{ latitude: 12.8754709, longitude: 77.6127866 }}
                  onLocationCapture={handleOutLocationCapture}
                  disabled={isVisitComplete}
                />

                {outLocationCaptured && (
                  <SelfieCapture
                    title="Check-Out Verification"
                    onCapture={handleOutSelfieCapture}
                    disabled={isVisitComplete}
                  />
                )}

                {isCheckOutReady && !isVisitComplete && (
                  <Button
                    className="w-full bg-healthcare-success hover:bg-healthcare-success/90 py-6"
                    onClick={() => setEndVisitDialogOpen(true)}
                  >
                    Complete Visit
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Check In Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Check In?</DialogTitle>
          </DialogHeader>
          <p>
            This will mark you as present at the patient's location. Are you
            ready to start the visit?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="mt-4"
            >
              Cancel
            </Button>
            <Button
              className="bg-healthcare-success hover:bg-healthcare-success/90"
              onClick={handleCompleteCheckIn}
            >
              Confirm Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Visit Dialog */}
      <Dialog open={endVisitDialogOpen} onOpenChange={setEndVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Visit?</DialogTitle>
          </DialogHeader>
          <p>
            This will mark the visit as completed. You won't be able to make
            further changes. Continue?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEndVisitDialogOpen(false)}
              className="mt-4"
            >
              Cancel
            </Button>
            <Button
              className="bg-healthcare-success hover:bg-healthcare-success/90"
              onClick={handleCompleteCheckOut}
            >
              Complete Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PractitionerDetail;
