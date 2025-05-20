import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import { FaCalendar, FaMapPin, FaSearch, FaUser } from "react-icons/fa";
import auth from "../api/user/auth";

export const PatientAssignmentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [practitioners, setPractitioners] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      const fetchUsers = await auth.getAllUsers();

      if (fetchUsers.status_code !== 0) {
        toast.error(fetchUsers.error);
        return;
      }

      const users = fetchUsers.data;

      const clients = users.filter((user) => user.entity_type === "client");
      const practs = users.filter((user) => user.entity_type === "pract");

      setClients(clients);
      setPractitioners(practs);
    };

    fetchData();
  }, []);
  

  const handleAssignPractitioner = async (
    client_id: string,
    practitionerId: string
  ) => {
    try {
      setLoading(true);
      // In a real app, you would make an API call to your backend
      // Example: await api.assignPractitionerToPatient(patientId, practitionerId,date)

      // For now, we'll update the local state to simulate the change
      const today = new Date().toISOString().split("T")[0];

      setClients(
        clients.map((client) =>
          client.id === client_id
            ? { ...client, assignedTo: practitionerId, assignedDate: today }
            : client
        )
      );

      toast("Client has been assigned to the practitioner successfully.");
    } catch (error) {
      toast("Could not assign patient to practitioner");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignPatient = async (patientId: string) => {
    try {
      setLoading(true);
      // In a real app, you would make an API call to your backend
      // Example: await api.unassignPatient(patientId)

      setClients(
        clients.map((client) =>
          client.id === client_id
            ? { ...client, assignedTo: undefined, assignedDate: undefined }
            : client
        )
      );

      toast("Client has been unassigned successfully.");
    } catch (error) {
      toast("Could not unassign patient");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignedPractitioner = (client_id: string) => {
    const client = clients.find((c) => c.id === client_id);
    if (!client?.assignedTo) return null;

    return practitioners.find((c) => c.id === client.assignedTo);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Assignment Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const assignedPractitioner = getAssignedPractitioner(client.user_id);

                return (
                  <TableRow key={client.user_id}>
                    <TableCell className="flex">
                      <FaUser className="h-4 w-4 text-gray-500 mr-1" />
                      <div className="font-medium">{client.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FaMapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {client.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.assignedDate && (
                        <div className="flex items-center">
                          <FaCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{client.assignedDate}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {!client.assignedTo ? (
                        <Select
                          onValueChange={(value) =>
                            handleAssignPractitioner(client.user_id, value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign practitioner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {practitioners
                              .filter((p) => p.is_active === true)
                              .map((practitioner) => (
                                <SelectItem
                                  key={practitioner.id}
                                  value={practitioner.id}
                                >
                                  {practitioner.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="font-medium text-primary">
                          {assignedPractitioner?.name || "Unknown"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {client.assignedTo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignPatient(client.user_id)}
                          disabled={loading}
                        >
                          Unassign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
