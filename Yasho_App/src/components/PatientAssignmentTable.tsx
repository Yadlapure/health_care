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
import AdminMap from "./AdminMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

export const PatientAssignmentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [visitMap, setVisitMap] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [showDatePicker, setShowDatePicker] = useState({});
  const [showMapPicker, setShowMapPicker] = useState({});
  const [selectedLocations, setSelectedLocations] = useState({});
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPractitioners, setSelectedPractitioners] = useState({});
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendClientId, setExtendClientId] = useState(null);
  const [newExtendDate, setNewExtendDate] = useState("");



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
        (u) => u.entity_type === "employee" && u.is_active
      );

      let visitStatusMap = {};

      if (fetchVisits.status_code === 0) {
        const visitsData = fetchVisits.data;

        visitsData.forEach((visit) => {
          if (
            visit.is_active &&
            visit.assigned_emp_id &&
            visit.main_status !== "CHECKEDOUT"
          ) {
            const assignedId = visit.assigned_pract_id || visit.assigned_emp_id;
            const assignedUser = users.find((u) => u.user_id === assignedId);

            visitStatusMap[visit.assigned_client_id] = {
              practitionerId: assignedId,
              practitionerName: assignedUser?.name || "",
              fromDate: visit.from_ts,
              toDate: visit.to_ts,
              visitId: visit.visit_id,
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
          assignedFromDate: visit?.fromDate || null,
          assignedToDate: visit?.toDate || null,
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

  const handleAssignPractitioner = async (
    clientId,
    empId,
    fromDate,
    toDate
  ) => {
    try {
      setLoading(true);
      const from_ts = new Date(fromDate).getTime();
      const to_ts = new Date(toDate).getTime();
      const location = selectedLocations[clientId];

      if (!fromDate || !toDate) {
        toast.error("Please select valid from and to dates.");
        setLoading(false);
        return;
      }

      if (!location) {
        toast.error("Please select location on map.");
        setLoading(false);
        return;
      }

      const response = await visits.assignPractToClient(
        clientId,
        empId,
        from_ts,
        to_ts,
        location.lat.toString(),
        location.lng.toString()
      );

      if (response.status_code !== 0) {
        toast.error("Failed to assign practitioner.");
        return;
      }else{
          toast.success("Assigned successfully.");
         await fetchData()
      }

      setSelectedDates((prev) => {
        const copy = { ...prev };
        delete copy[clientId];
        return copy;
      });
      setSelectedLocations((prev) => {
        const copy = { ...prev };
        delete copy[clientId];
        return copy;
      });
      setShowDatePicker((prev) => ({
        ...prev,
        [clientId]: false,
      }));
      setShowMapPicker((prev) => ({
        ...prev,
        [clientId]: false,
      }));
    } catch (error) {
      toast.error("Could not assign practitioner.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignPractitioner = async (clientId) => {
    try {
      setLoading(true);
      const visitId = visitMap[clientId]?.visitId;

      if (!visitId) {
        toast.error("Visit ID not found for unassignment.");
        setLoading(false);
        return;
      }
      
      const response = await visits.unAssignPractToClient(visitId);

      if (response.status_code !== 0) {
        toast.error("Failed to unassign practitioner.");
        return;
      }

      toast.success("Unassigned successfully.");
      await fetchData();
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

  const handleDateChange = (clientId, fromDate, toDate) => {
    setSelectedDates((prev) => ({
      ...prev,
      [clientId]: { fromDate, toDate },
    }));
  };

  const toggleDatePicker = (clientId) => {
    setShowDatePicker((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const toggleMapPicker = (clientId) => {
    setShowMapPicker((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const handleLocationChange = (clientId, latlng) => {
    setSelectedLocations((prev) => ({
      ...prev,
      [clientId]: latlng,
    }));
  };

  const handleExtendVisit = async () => {
    try {
      setLoading(true);
      const clientId = extendClientId;
      const visitId = visitMap[clientId]?.visitId;

      if (!visitId || !newExtendDate) {
        toast.error("Missing visit ID or new end date.");
        return;
      }

      const to_ts = new Date(newExtendDate).getTime();
      const response = await visits.extendPract(visitId, to_ts);

      if (response.status_code !== 0) {
        toast.error(response.error);
        return;
      }

      toast.success("Visit extended successfully.");
      await fetchData();

      setExtendModalOpen(false);
      setExtendClientId(null);
      setNewExtendDate("");
    } catch (err) {
      toast.error("Could not extend visit.");
    } finally {
      setLoading(false);
    }
  };
  
  const assignedPractitionerIds = new Set(
    Object.values(visitMap).map((v) => v.practitionerId)
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
              <TableHead>Select Date</TableHead>
              <TableHead>Pick Location</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                    {client.assignedFromDate && client.assignedToDate ? (
                      <div className="flex items-center">
                        <FaCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {new Date(
                            client.assignedFromDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(client.assignedToDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Not assigned
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {!client.assignedTo && (
                      <div className="flex space-x-2 items-center">
                        <FaCalendar
                          className="h-5 w-5 cursor-pointer text-muted-foreground"
                          onClick={() => toggleDatePicker(client.user_id)}
                        />
                        {showDatePicker[client.user_id] && (
                          <div className="flex space-x-2">
                            <Input
                              type="date"
                              value={
                                selectedDates[client.user_id]?.fromDate || ""
                              }
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                handleDateChange(
                                  client.user_id,
                                  e.target.value,
                                  selectedDates[client.user_id]?.toDate
                                )
                              }
                            />
                            <Input
                              type="date"
                              value={
                                selectedDates[client.user_id]?.toDate || ""
                              }
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                handleDateChange(
                                  client.user_id,
                                  selectedDates[client.user_id]?.fromDate,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {!client.assignedTo && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => toggleMapPicker(client.user_id)}
                          variant="outline"
                        >
                          {showMapPicker[client.user_id]
                            ? "Hide Map"
                            : "Pick Location"}
                        </Button>

                        {showMapPicker[client.user_id] && (
                          <div className="mt-2">
                            <AdminMap
                              initialPosition={
                                selectedLocations[client.user_id]
                              }
                              onConfirm={(pos) => {
                                handleLocationChange(client.user_id, pos);
                                toggleMapPicker(client.user_id); // Hide map after confirm
                                toast.success("Location confirmed!");
                              }}
                              onCancel={() => toggleMapPicker(client.user_id)} // Just hide map on cancel
                            />
                          </div>
                        )}
                      </>
                    )}
                    {client.assignedTo && (
                      <div className="text-muted-foreground">
                        {selectedLocations[client.user_id]
                          ? `Lat: ${selectedLocations[
                              client.user_id
                            ].lat.toFixed(4)}, Lng: ${selectedLocations[
                              client.user_id
                            ].lng.toFixed(4)}`
                          : "------"}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {!client.assignedTo ? (
                      <Select
                        value={selectedPractitioners[client.user_id] || ""}
                        onValueChange={(value) => {
                          const fromDate =
                            selectedDates[client.user_id]?.fromDate;
                          const toDate = selectedDates[client.user_id]?.toDate;

                          setSelectedPractitioners((prev) => ({
                            ...prev,
                            [client.user_id]: value,
                          }));

                          setPendingAssignment({
                            clientId: client.user_id,
                            empId: value,
                            fromDate,
                            toDate,
                          });
                          setShowConfirmDialog(true);
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign practitioner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {practitioners
                            .filter((practitioner) => {
                              const selectedFromStr =
                                selectedDates[client.user_id]?.fromDate;
                              const selectedToStr =
                                selectedDates[client.user_id]?.toDate;

                              if (!selectedFromStr || !selectedToStr)
                                return false;

                              const normalize = (dStr) => {
                                const d = new Date(dStr);
                                d.setHours(0, 0, 0, 0);
                                return d.getTime();
                              };

                              const selectedFrom = normalize(selectedFromStr);
                              const selectedTo = normalize(selectedToStr);

                              const visit = Object.values(visitMap).find(
                                (v) => v.practitionerId === practitioner.user_id
                              );

                              if (!visit) return true;

                              const assignedFrom = normalize(visit.fromDate);
                              const assignedTo = normalize(visit.toDate);

                              const overlaps =
                                selectedFrom <= assignedTo &&
                                selectedTo >= assignedFrom;

                              return !overlaps;
                            })
                            .map((practitioner) => (
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
                      <div className="flex space-x-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => {
                            setExtendClientId(client.user_id);
                            setNewExtendDate("");
                            setExtendModalOpen(true);
                          }}
                        >
                          Extend
                        </Button>

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
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
          </DialogHeader>

          {pendingAssignment && (
            <div className="text-sm space-y-2">
              <p>Are you sure you want to assign</p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                if (pendingAssignment?.clientId) {
                  setSelectedPractitioners((prev) => {
                    const copy = { ...prev };
                    delete copy[pendingAssignment.clientId];
                    return copy;
                  });
                }
                setPendingAssignment(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (pendingAssignment) {
                  handleAssignPractitioner(
                    pendingAssignment.clientId,
                    pendingAssignment.empId,
                    pendingAssignment.fromDate,
                    pendingAssignment.toDate
                  );
                }

                setSelectedPractitioners((prev) => {
                  const copy = { ...prev };
                  delete copy[pendingAssignment.clientId];
                  return copy;
                });
                setShowConfirmDialog(false);
                setPendingAssignment(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Visit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {extendClientId && (
              <Input
                type="date"
                min={
                  visitMap[extendClientId]?.toDate
                    ? new Date(
                        new Date(visitMap[extendClientId].toDate).getTime() +
                          24 * 60 * 60 * 1000
                      )
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                value={newExtendDate}
                onChange={(e) => setNewExtendDate(e.target.value)}
              />
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setExtendModalOpen(false);
                setNewExtendDate("");
                setExtendClientId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleExtendVisit}
              disabled={!newExtendDate || loading}
            >
              Confirm Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
