import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ClientsTable } from "../components/ClientsTable";
import { PatientAssignmentTable } from "../components/PatientAssignmentTable";
import Header from "../components/Header";
import { VisitTable } from "../components/VisitTable";
import { EmployeeTable } from "../components/EmployeeTable";
import EmployeesAttendanceLog from "../components/EmployeesAttendanceLog";

const AdminDashboard = ({ setIsAuthenticated, setUser, user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        title="Yashocare"
        rightContent={true}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
        profile={null}
      />
      <div className="py-4 w-full max-w-screen-2xl mx-auto px-4">
        <Tabs defaultValue="assignments">
          <TabsList className="mb-4 flex overflow-x-auto whitespace-nowrap no-scrollbar">
            <TabsTrigger className="min-w-[140px]" value="assignments">
              Patient Assignments
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="visits">
              Visits
            </TabsTrigger>
            <TabsTrigger className="min-w-[60px]" value="clients">
              Clients
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="employees">
              Employees
            </TabsTrigger>
            <TabsTrigger className="min-w-[100px]" value="attendance">
              Attendance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mx-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Patient Assignments</CardTitle>
                <CardDescription>
                  Assign practitioners to patients for visits
                </CardDescription>
              </CardHeader>

              <CardContent>
                <PatientAssignmentTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Clients</CardTitle>
              </CardHeader>

              <CardContent>
                <ClientsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Visits</CardTitle>
              </CardHeader>

              <CardContent>
                <VisitTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeesAttendanceLog
                  currentUserEntityType={user?.data?.profile?.entity_type}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
