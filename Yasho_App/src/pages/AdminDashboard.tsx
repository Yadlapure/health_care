import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { UsersTable } from "../components/UsersTable";
import { PatientAssignmentTable } from "../components/PatientAssignmentTable";
import Header from "../components/Header";

const AdminDashboard = ({ user, setIsAuthenticated, setUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        // setIsAuthenticated={setIsAuthenticated}
        // setUser={setUser}
        title="Yashocare"
        rightContent={true}
      />
      <div className="py-4 w-full max-w-4xl m-auto ">
        <Tabs defaultValue="assignments">
          <TabsList className="mb-4 flex overflow-x-auto no-scrollbar">
            <TabsTrigger className="min-w-[160px]" value="assignments">
              Patient Assignments
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="users">
              Users
            </TabsTrigger>
            <TabsTrigger className="min-w-[80px]" value="settings">
              Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mx-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Patient Assignments</CardTitle>
                <CardDescription>
                  Assign practitioners to patients for home visits
                </CardDescription>
              </CardHeader>

              <CardContent>
                <PatientAssignmentTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  View and manage user roles across the platform
                </CardDescription>
              </CardHeader>

              <CardContent>
                <UsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mx-2">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p>Settings panel content will go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
