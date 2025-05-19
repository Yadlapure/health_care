import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  FaCalendarCheck,
  FaStethoscope,
  FaNotesMedical,
  FaUserMd,
} from "react-icons/fa";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import VisitCard from "../components/VisitCard";
import { Button } from "../components/ui/button";
import visits from "../api/visits/visits";

const ClientDashboard = ({ user, setIsAuthenticated, setUser }) => {
  const [practVisit, setPractVisit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       const allVisits = await visits.getVisits();
  //       setPractVisit(allVisits.data)
  //     } catch (error) {
  //       console.error("Error loading data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadData();
  // }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await visits.getVisits();
        const allData = response.data || [];

        let filteredData = [];
        if (activeTab === "today") {
          filteredData = allData.filter((v) => v.status === "CHECKEDIN");
        } else if (activeTab === "upcoming") {
          filteredData = allData.filter((v) => v.status === "INITIATED");
        } else if (activeTab === "completed") {
          filteredData = allData.filter((v) => v.status === "CHECKEDOUT");
        }

        setPractVisit(filteredData);
      } catch (error) {
        console.error("Error fetching visits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header title="Yashocare" setIsAuthenticated={setIsAuthenticated} setUser={ setUser} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            Loading your healthcare information...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
        title="Yashocare"
        // rightContent={
        //   <Button
        //     variant="ghost"
        //     size="icon"
        //     onClick={() => (window.location.href = "/profile")}
        //   >
        //     <FaUserMd className="h-5 w-5" />
        //   </Button>
        // }
      />

      <div className="p-4 max-w-md mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Welcome, {user?.data?.profile?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Here you can view your Today, upcoming and past visits with
              Yashocare practitioners.
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-1">
              <FaCalendarCheck className="h-4 w-4" />
              <span>Today Visit</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-1">
              <FaStethoscope className="h-4 w-4" />
              <span>Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1">
              <FaNotesMedical className="h-4 w-4" />
              <span>Completed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-4">
            {practVisit.filter((v) => v.status === "CHECKEDIN").length > 0 ? (
              practVisit
                .filter((v) => v.status === "CHECKEDIN")
                .map((visit) => (
                  <VisitCard
                    key={visit.visit_id}
                    visit={visit}
                    practitionerName={
                      visit.assigned_pract ?? "No practitioner assigned"
                    }
                  />
                ))
            ) : (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <p className="text-healthcare-gray">
                  No visits found for today.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {practVisit.filter((v) => v.status === "INITIATED").length > 0 ? (
              practVisit
                .filter((v) => v.status === "INITIATED")
                .map((visit) => (
                  <VisitCard
                    key={visit.visit_id}
                    visit={visit}
                    practitionerName={visit.assigned_pract}
                  />
                ))
            ) : (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <p className="text-healthcare-gray">No upcoming visits.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {practVisit.filter((v) => v.status === "CHECKEDOUT").length > 0 ? (
              practVisit
                .filter((v) => v.status === "CHECKEDOUT")
                .map((visit) => (
                  <VisitCard
                    key={visit.visit_id}
                    visit={visit}
                    practitionerName={visit.assigned_pract}
                  />
                ))
            ) : (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <p className="text-healthcare-gray">No completed visits.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
