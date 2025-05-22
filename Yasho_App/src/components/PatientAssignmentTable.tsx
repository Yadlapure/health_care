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
import { FaCalendar, FaSearch } from "react-icons/fa";
import auth from "../api/user/auth";
import visits from "../api/visits/visits";

export const PatientAssignmentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [visitMap, setVisitMap] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchUsers, fetchVisits] = await Promise.all([
        auth.getAllUsers(),
        visits.getVisits(),
      ]);

      if (fetchUsers.status_code !== 0) {
        toast.error(fetchUsers.error || "Failed to fetch users");
        return;
      }

      const users = fetchUsers.data;
      const clients = users.filter((u) => u.entity_type === "client");
      const practs = users.filter(
        (u) => u.entity_type === "pract" && u.is_active
      );

      let visitStatusMap = {};

      if (fetchVisits.status_code === 0) {
        const visitsData = fetchVisits.data;

        // Only map non-cancelled visits
        visitsData.forEach((visit) => {
          if (
            visit.state !== "CANCELLEDVISIT" &&
            visit.assigned_client_id &&
            visit.assigned_pract_id
          ) {
            visitStatusMap[visit.assigned_client_id] = {
              practitionerId: visit.assigned_pract_id,
              practitionerName: users.find(
                (u) => u.user_id === visit.assigned_pract_id
              )?.name,
              assignedDate: visit.for_date,
            };
          }
        });
      }

      const updatedClients = clients.map((client) => {
        const visit = visitStatusMap[client.user_id];
        return {
          ...client,
          assignedTo: visit?.practitionerId || null,
          practitionerName: visit?.practitionerName || null,
          assignedDate: visit?.assignedDate || null,
        };
      });

      setVisitMap(visitStatusMap);
      setClients(updatedClients);
      setPractitioners(practs);
    } catch (error) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignPractitioner = async (clientId, practitionerId) => {
    try {
      setLoading(true);
      const date = Date.now();
      const response = await visits.assignPractToClient(
        clientId,
        practitionerId,
        date
      );

      if (response.status_code !== 0) {
        toast.error("Failed to assign practitioner.");
        return;
      }

      toast.success("Assigned successfully.");
      await fetchData();
    } catch (error) {
      toast.error("Could not assign practitioner.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignPractitioner = async (clientId) => {
    try {
      setLoading(true);
      const assignedDate = clients.find(
        (c) => c.user_id === clientId
      )?.assignedDate;
      const response = await visits.unAssignPractToClient(
        clientId,
        assignedDate
      );

      if (response.status_code !== 0) {
        toast.error("Failed to unassign practitioner.");
        return;
      }

      toast.success("Unassigned successfully.");
      await fetchData(); // Refresh after unassignment
    } catch (error) {
      toast.error("Could not unassign practitioner.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              filteredClients.map((client) => (
                <TableRow key={client.user_id}>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                  </TableCell>
                  <TableCell>
                    {client.assignedDate && (
                      <div className="flex items-center">
                        <FaCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {new Date(client.assignedDate).toLocaleDateString()}
                        </span>
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
                          {practitioners.map((practitioner) => (
                            <SelectItem
                              key={practitioner.user_id}
                              value={practitioner.user_id}
                            >
                              {practitioner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-medium text-primary">
                        {client.practitionerName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.assignedTo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUnassignPractitioner(client.user_id)
                        }
                        disabled={loading}
                      >
                        Unassign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
