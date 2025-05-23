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
import AttendanceLog from "../components/AttendanceLog";


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
  const [ visitLocation,setVisitLocation] = useState(null)

  const [activeTab, setActiveTab] = useState("INITIATED");

  const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const loadVisitData = async () => {
    try {
      setLoading(true);

      const visitData = await visits.getVisits();
      if (visitData.status_code !== 0) {
        toast.error(visitData.error);
        return;
      }

      const today = new Date();

      const todayVisit = visitData.data.find((visit) => {
        const fromDate = new Date(visit.from_ts);
        const toDate = new Date(visit.to_ts);

        const isInRange =
          today >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
          today <= new Date(toDate.setHours(23, 59, 59, 999));

        if (!isInRange) return false;

        return visit.details?.some((detail) =>
          isSameDate(detail.for_date, today)
        );
      });

      if (!todayVisit) {
        toast.error("No visit scheduled for today.");
        return;
      }

      const todayDetail = todayVisit.details.find((detail) =>
        isSameDate(detail.for_date, today)
      );

      if (!todayDetail) {
        toast.error("No detail entry found for today.");
        return;
      }      

      setVisit({ ...todayDetail });
      setVisitLocation(todayVisit);

      // Dashboard visibility logic
      const { daily_status, checkIn } = todayDetail;

      const isInit =
        todayVisit.main_status === "INITIATED" ||
        todayVisit.main_status === "CHECKEDIN";
      const hasNotCapturedAnything = !checkIn?.lat && !checkIn?.img;

      if (isInit && hasNotCapturedAnything) {
        setShowDashboard(true);
      }

      if (daily_status === "CHECKEDIN") {
        setInLocationCaptured(true);
        setInSelfieCaptured(true);
      }

      if (daily_status === "VITALUPDATE") {
        setOutLocationCaptured(!!todayDetail?.checkOut?.lat);
        setOutSelfieCaptured(!!todayDetail?.checkOut?.img);
        setCapturedOutLocation(
          todayDetail?.checkOut?.lat && {
            latitude: todayDetail.checkOut.lat,
            longitude: todayDetail.checkOut.lng,
          }
        );
        setCapturedOutSelfie(todayDetail?.checkOut?.img || null);
      }
      

      if (daily_status === "CHECKEDOUT") {
        setShowDashboard(true);
      }

      setActiveTab(daily_status);
    } catch (error) {
      console.error("Error loading visit:", error);
      toast.error("Failed to load visit data");
    } finally {
      setLoading(false);
    }
  };
  
  
  // Load visit data
  useEffect(() => {
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
      formData.append("visit_id", visitLocation.visit_id);

      const response = await visits.updatecheckInOut(formData);
      if (response.status_code === 0) {
        await loadVisitData()
        // Use functional update to ensure you're working with the latest state
        setVisit((prevVisit) => {
          const updatedVisit = {
            ...prevVisit,
            inLocation: capturedInLocation,
            inSelfie: capturedInSelfie,
          };
          return updatedVisit;
        });
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

    const data = {
      bloodPressure:vitals.bloodPressure,
      notes:vitals.notes,
      sugar:vitals.sugar,
      visit_id:visitLocation.visit_id
    }

    try {
      const response = await visits.updateVitals(data);
      if (response.status_code === 0) {
        await loadVisitData();
        // setVisit(response.data);
        setActiveTab("VITALUPDATE");
        setVitalsCaptured(true);

        toast.success("Patient vitals saved");
      }
      
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
      formData.append("visit_id", visitLocation.visit_id);

      const response = await visits.updatecheckInOut(formData);
      if (response.status_code === 0) {
        await loadVisitData();
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
        <div className="p-4">
          <AttendanceLog />
        </div>
      </div>
    );
  }

  // Check if check-in is ready
  const isCheckInReady =
    inLocationCaptured &&
    inSelfieCaptured &&
    visit.daily_status === "INITIATED";

  // Check if check-out is ready
  const isCheckOutReady =
    visit.daily_status === "VITALUPDATE" &&
    outLocationCaptured &&
    outSelfieCaptured;

  // Check visit status to show appropriate content
  const showCheckInContent = true;
  const showVitalsContent = visit.daily_status === "CHECKEDIN";
  const showCheckOutContent = visit.daily_status === "VITALUPDATE";
  const isVisitComplete = visit.daily_status === "CHECKEDOUT";

  // Determine which tabs are enabled
  const isAssessmentTabEnabled =
    inLocationCaptured &&
    inSelfieCaptured &&
    visit.daily_status === "INITIATED";
  const isCheckOutTabEnabled =
    isAssessmentTabEnabled &&
    vitalsCaptured &&
    (visit.daily_status === "CHECKEDIN" || visit.daily_status === "CHECKEDOUT");

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
            visit.daily_status === "INITIATED" && setShowDashboard(false)
          }
        />
        <AttendanceLog />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      <Header
        title={`YOUR VISIT`}
        showBack={visit.daily_status === "INITIATED" ? true : false}
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
              <span className="hidden sm:inline">Vitals</span>
            </TabsTrigger>
            <TabsTrigger
              value="VITALUPDATE"
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
                  // patientLocation={visit.location}
                  userLocation={visitLocation.inLocation}
                  patientLocation={{
                    latitude: visitLocation.location.lat,
                    longitude: visitLocation.location.lng,
                  }}
                  // userLocation={{ latitude: 12.8754709, longitude: 77.6127866 }}
                  onLocationCapture={handleInLocationCapture}
                  disabled={visit.daily_status !== "INITIATED"}
                />

                {capturedInLocation && (
                  <SelfieCapture
                    title="Check-In Verification"
                    onCapture={handleInSelfieCapture}
                    disabled={visit.daily_status !== "INITIATED"}
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
                  patientLocation={{
                    latitude: visitLocation.location.lat,
                    longitude: visitLocation.location.lng,
                  }}
                  userLocation={visitLocation.inLocation}
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
