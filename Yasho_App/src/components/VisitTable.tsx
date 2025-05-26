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
  const [currentPage, setCurrentPage] = useState(1);
  const [checkoutImages, setCheckoutImages] = useState<{
    [key: string]: string;
  }>({});

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

  const openVitalsModal = async (visit) => {
    setSelectedVisit(visit);
    setModalOpen(true);

    const imgPaths = visit.details
      .flatMap((detail) => [detail.checkIn?.img, detail.checkOut?.img])
      .filter(Boolean);

    if (imgPaths.length > 0) {
      try {
        const response = await visits.getImageURL(imgPaths);
        if (response.status_code === 0 && Array.isArray(response.data)) {
          const flatImageMap = response.data.reduce((acc, obj) => {
            const [key, value] = Object.entries(obj)[0];
            acc[key] = value;
            return acc;
          }, {});
          setCheckoutImages(flatImageMap);
        } else {
          toast.error("Failed to fetch image URLs.");
        }
      } catch (err) {
        toast.error("Something went wrong while fetching images.");
      }
    }
  };

  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = visitsData
    .filter((visit) => visit.status !== "CANCELLEDVISIT")
    .slice(indexOfFirstVisit, indexOfLastVisit);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                      <span>{visit.main_status || ""}</span>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>

          {selectedVisit ? (
            <div className="space-y-4 text-sm">
              <div>
                <strong>Visit Period:</strong>{" "}
                {selectedVisit.from_ts && selectedVisit.to_ts
                  ? `${new Date(
                      selectedVisit.from_ts
                    ).toLocaleDateString()} - ${new Date(
                      selectedVisit.to_ts
                    ).toLocaleDateString()}`
                  : "N/A"}
              </div>

              {selectedVisit.details.map((detail, index) => (
                <div key={index} className="border-t pt-2">
                  <h4 className="font-semibold mb-1">
                    Date: {new Date(detail.for_date).toLocaleDateString()}
                  </h4>
                  <div>
                    <strong>Check-In Time:</strong>{" "}
                    {detail.checkIn?.at
                      ? new Date(detail.checkIn.at).toLocaleTimeString()
                      : "N/A"}
                  </div>
                  {detail.checkIn?.img &&
                    checkoutImages[detail.checkIn.img] && (
                      <div className="mt-2">
                        <img
                          src={checkoutImages[detail.checkIn.img]}
                          alt="Check-In"
                          className="w-32 h-32 object-cover rounded-full border cursor-pointer transition-transform hover:scale-110"
                          title="Check-In image"
                        />
                      </div>
                    )}

                  <div>
                    <strong>Check-Out Time:</strong>{" "}
                    {detail.checkOut?.at
                      ? new Date(detail.checkOut.at).toLocaleTimeString()
                      : "N/A"}
                  </div>

                  {detail.checkOut?.img &&
                    checkoutImages[detail.checkOut.img] && (
                      <div className="mt-2">
                        <img
                          src={checkoutImages[detail.checkOut.img]}
                          alt="Checkout"
                          className="w-32 h-32 object-cover rounded-full border cursor-pointer transition-transform hover:scale-110"
                          title="Checkout image"
                        />
                      </div>
                    )}

                  <div>
                    <strong>Sugar:</strong>{" "}
                    {detail.vitals?.sugar ? `${detail.vitals.sugar}` : "N/A"}
                  </div>
                  <div>
                    <strong>Blood Pressure:</strong>{" "}
                    {detail.vitals?.bloodPressure || "N/A"}
                  </div>
                  <div>
                    <strong>Notes:</strong>{" "}
                    {detail.vitals?.notes ? `${detail.vitals.notes}` : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No visit data found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
