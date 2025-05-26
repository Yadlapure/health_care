import React, { useEffect, useState } from "react";
import AttendanceLog from "./AttendanceLog";
import auth from "../api/user/auth";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface Employee {
  user_id: string;
  name: string;
  mobile: string;
  address: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

const EmployeesAttendanceLog: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await auth.getAllUsers();
        if (response.status_code === 0 && Array.isArray(response.data)) {
          const filteredEmployees = response.data.filter(
            (user: any) => user.entity_type === "employee"
          );
          const mappedEmployees = filteredEmployees.map((emp: any) => ({
            user_id: emp.user_id,
            name: emp.name,
            mobile: emp.mobile,
            address: emp.address || "",
            updated_at: emp.updated_at,
          }));
          setEmployees(mappedEmployees);
        } else {
          setError("Failed to load employees.");
        }
      } catch (e) {
        setError("Failed to fetch employees.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleShowAttendance = (emp: Employee) => {
    if (selectedEmployeeId === emp.user_id) {
      setSelectedEmployeeId(null);
      setSelectedEmployee(null);
    } else {
      setSelectedEmployeeId(emp.user_id);
      setSelectedEmployee(emp);
    }
  };

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      {loading && <p>Loading employees...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && employees.length === 0 && (
        <p>No employees found.</p>
      )}

      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Joining</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedEmployees.map((emp) => (
              <TableRow key={emp.user_id}>
                <TableCell>{emp.user_id}</TableCell>
                <TableCell>{emp.updated_at?.split("T")[0]}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.mobile}</TableCell>
                <TableCell className="max-w-[130px] whitespace-pre-wrap break-words">
                  {emp.address}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant={
                      selectedEmployeeId === emp.user_id
                        ? "secondary"
                        : "outline"
                    }
                    onClick={() => handleShowAttendance(emp)}
                  >
                    {selectedEmployeeId === emp.user_id
                      ? "Hide Attendance"
                      : "Show Attendance"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => changePage(currentPage - 1)} />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={i + 1 === currentPage}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => changePage(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedEmployee && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2 text-[#00847e]">
            Attendance for {selectedEmployee.name}
          </h2>
          <AttendanceLog user={{ user_id: selectedEmployee.user_id }} />
        </div>
      )}
    </div>
  );
};

export default EmployeesAttendanceLog;
