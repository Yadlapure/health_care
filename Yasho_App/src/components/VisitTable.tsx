import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
import { FaCalendar, FaSearch, FaUser } from "react-icons/fa";
import auth from "../api/user/auth";
import visits from "../api/visits/visits";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { formatDate } from "../utils/formatDate";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "./ui/pagination";

export const VisitTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [visitsData, setVisitsData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [nextVisit, setNextVisit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const visitsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const fetchUsers = await auth.getAllUsers();
      if (fetchUsers.status_code !== 0) {
        toast.error(fetchUsers.error);
        return;
      }

      const users = fetchUsers.data;
      setClients(users.filter((u) => u.entity_type === "client"));
      setPractitioners(users.filter((u) => u.entity_type === "employee"));
    };

    const fetchVisits = async () => {
      const fetchVisits = await visits.getVisits();
      if (fetchVisits.status_code !== 0) {
        toast.error(fetchVisits.error);
        return;
      }

      setVisitsData(fetchVisits.data);
    };

    fetchData();
    fetchVisits();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.assigned &&
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openVitalsModal = (visit) => {
    setSelectedVisit(visit);
    setModalOpen(true);

    // Find the next visit for the client
    const clientVisits = visitsData.filter(
      (visitData) => visitData.assigned_client_id === visit.assigned_client_id
    );

    const sortedVisits = clientVisits.sort(
      (a, b) => new Date(a.for_date) - new Date(b.for_date)
    );

    const selectedVisitIndex = sortedVisits.findIndex(
      (v) => v.visit_id === visit.visit_id
    );

    // Find the next visit
    const nextVisit = sortedVisits[selectedVisitIndex + 1];
    setNextVisit(nextVisit || null);
  };

  // Pagination logic
  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = visitsData
    .filter((visit) => visit.status !== "CANCELLEDVISIT")
    .slice(indexOfFirstVisit, indexOfLastVisit);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total number of pages
  const totalPages = Math.ceil(
    visitsData.filter((visit) => visit.status !== "CANCELLEDVISIT").length /
      visitsPerPage
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentVisits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              currentVisits.map((visit) => {
                const client = clients.find(
                  (client) => client.user_id === visit.assigned_client_id
                );
                const practitioner = practitioners.find(
                  (p) => p.user_id === visit.assigned_pract_id
                );

                return (
                  <TableRow key={visit.visit_id}>
                    <TableCell>
                      <div className="font-medium">{client?.name}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <FaCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {visit.from_ts && visit.to_ts
                            ? `${new Date(
                                visit.from_ts
                              ).toLocaleDateString()} - ${new Date(
                                visit.to_ts
                              ).toLocaleDateString()}`
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const assignedId =
                          visit.assigned_pract_id || visit.assigned_emp_id;
                        const assignedPerson = practitioners.find(
                          (p) => p.user_id === assignedId
                        );
                        return assignedPerson ? (
                          <div className="flex items-center">
                            <FaUser className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{assignedPerson.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        );
                      })()}
                    </TableCell>

                    <TableCell>
                      <span>{visit.main_status || "Unknown"}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openVitalsModal(visit)}
                        title={
                          visit.status !== "CHECKEDOUT"
                            ? "Available after checkout"
                            : "View details"
                        }
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          />
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationNext
            onClick={() =>
              currentPage < totalPages && paginate(currentPage + 1)
            }
          />
        </PaginationContent>
      </Pagination>

      {/* Modal for visit details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>

          {selectedVisit ? (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Status:</strong> {selectedVisit.status ?? "Unknown"}
              </div>
              <div>
                <strong>Check-In Time:</strong>{" "}
                {selectedVisit?.checkIn?.at
                  ? formatDate(selectedVisit.checkIn.at)
                  : "Not checked in"}
              </div>
              <div>
                <strong>Check-Out Time:</strong>{" "}
                {selectedVisit?.checkOut?.at
                  ? formatDate(selectedVisit.checkOut.at)
                  : "Not checked out"}
              </div>
              <div>
                <strong>Blood Pressure:</strong>{" "}
                {selectedVisit.vitals?.bloodPressure ?? "N/A"}
              </div>
              <div>
                <strong>Sugar:</strong> {selectedVisit.vitals?.sugar ?? "N/A"}
              </div>
              <div>
                <strong>Notes:</strong>{" "}
                {selectedVisit.vitals?.notes?.trim() || "No notes provided"}
              </div>
              {selectedVisit.vitals?.prescription_images?.length > 0 && (
                <div>
                  <strong>Prescription Images:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedVisit.vitals.prescription_images.map(
                      (img, idx) => (
                        <li key={idx}>
                          <a
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Image {idx + 1}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>No visit data found.</p>
          )}

          {nextVisit ? (
            <div className="mt-4">
              <strong>Next Visit:</strong>
              <div>
                <strong>Scheduled Date:</strong>{" "}
                {formatDate(nextVisit.for_date)}
              </div>
              <div>
                <strong>Status:</strong> {nextVisit.status}
              </div>
              <div>
                <strong>Assigned To:</strong>{" "}
                {practitioners.find(
                  (p) => p.user_id === nextVisit.assigned_pract_id
                )?.name || "Not assigned"}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <strong>No upcoming visits scheduled.</strong>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
