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

const AdminDashboard = ({  setIsAuthenticated, setUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        title="Yashocare"
        rightContent={true}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
      />
      <div className="py-4 w-full max-w-4xl m-auto ">
        <Tabs defaultValue="assignments">
          <TabsList className="mb-4 flex overflow-x-auto no-scrollbar">
            <TabsTrigger className="min-w-[160px]" value="assignments">
              Patient Assignments
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="visits">
              Visits
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="clients">
              Clients
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="employees">
              Employees
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
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  View and manage user roles across the platform
                </CardDescription>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
