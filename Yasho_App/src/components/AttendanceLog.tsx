import React, { useEffect, useState } from "react";
import {
  FaCalendar,
  FaUserTimes,
  FaCheck,
  FaArrowCircleRight,
  FaPencilAlt,
} from "react-icons/fa";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import auth from "../api/user/auth";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

type AttendanceStatus = "Success" | "Absent" | "Alert" | "Weekend" | "NC";

interface LogEntry {
  id: string;
  date: string;
  inTime?: string;
  outTime?: string;
  location?: string;
  status: AttendanceStatus;
  reason?: string;
}

interface AttendanceLogProps {
  user: { user_id: string };
}

const AttendanceLog: React.FC<AttendanceLogProps> = ({ user }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [fromTs, setFromTs] = useState<Date>(startOfMonth(new Date()));
  const [toTs, setToTs] = useState<Date>(endOfMonth(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "MMMM")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    format(new Date(), "yyyy")
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const logsPerPage = 5;

  const statusMap: Record<string, AttendanceStatus> = {
    present: "Success",
    absent: "Absent",
    half_day: "Alert",
    weekend: "Weekend",
    nc: "NC",
  };

  const transformResponseData = (
    data: Record<
      string,
      {
        status: string;
        check_in_time: string | null;
        check_out_time: string | null;
      }
    >
  ): LogEntry[] => {
    return Object.entries(data).map(([date, value], index) => ({
      id: `${date}-${index}`,
      date,
      status: statusMap[value.status.toLowerCase()] || "NC",
      inTime: value.check_in_time
        ? format(new Date(value.check_in_time), "HH:mm")
        : undefined,
      outTime: value.check_out_time
        ? format(new Date(value.check_out_time), "HH:mm")
        : undefined,
    }));
  };
  

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await auth.getAttendance(
          user?.user_id,
          format(fromTs, "yyyy-MM-dd"),
          format(toTs, "yyyy-MM-dd")
        );        
        if (
          response.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          const logsArray = transformResponseData(response.data);
          setLogs(logsArray);
        } else {
          console.error("Unexpected data format", response.data);
          setLogs([]);
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance logs.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchLogs();
    }
  }, [user?.user_id, fromTs, toTs]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);

    if (date) {
      setSelectedMonth(format(date, "MMMM"));
      setSelectedYear(format(date, "yyyy"));
    } else {
      const now = new Date();
      const newFrom = startOfMonth(now);
      const newTo = endOfMonth(now);
      setFromTs(newFrom);
      setToTs(newTo);
      setSelectedMonth(format(newFrom, "MMMM"));
      setSelectedYear(format(newFrom, "yyyy"));
    }
  };

  const clearFilter = () => {
    setSelectedDate(undefined);
    const now = new Date();
    const newFrom = startOfMonth(now);
    const newTo = endOfMonth(now);
    setFromTs(newFrom);
    setToTs(newTo);
    setSelectedMonth(format(newFrom, "MMMM"));
    setSelectedYear(format(newFrom, "yyyy"));
  };

  const filteredLogs = selectedDate
    ? logs.filter((log) => log.date === format(selectedDate, "yyyy-MM-dd"))
    : logs;

  const openReasonDialog = (logId: string) => {
    const log = logs.find((log) => log.id === logId);
    setSelectedLogId(logId);
    setReasonText(log?.reason || "");
    setIsDialogOpen(true);
  };

  const saveReason = () => {
    if (selectedLogId) {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === selectedLogId ? { ...log, reason: reasonText } : log
        )
      );
      setIsDialogOpen(false);
      setSelectedLogId(null);
      setReasonText("");
    }
  };

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );


  const getStatusInfo = (status: AttendanceStatus) => {
    switch (status) {
      case "Success":
        return { color: "#4ADE80", icon: <FaCheck className="mr-1" /> };
      case "Absent":
        return { color: "#F87171", icon: <FaUserTimes className="mr-1" /> };
      case "Alert":
      case "NC":
        return {
          color: "#FBBF24",
          icon: <FaArrowCircleRight className="mr-1" />,
        };
      case "Weekend":
        return { color: "#94A3B8", icon: <FaCalendar className="mr-1" /> };
      default:
        return { color: "#8E9196", icon: <FaCalendar className="mr-1" /> };
    }
  };

  const totalWorkingDays = filteredLogs.length;
  const successDays = filteredLogs.filter(
    (log) => log.status === "Success"
  ).length;
  const absentDays = filteredLogs.filter(
    (log) => log.status === "Absent"
  ).length;
  const alertDays = filteredLogs.filter(
    (log) => log.status === "Alert" || log.status === "NC"
  ).length;

  return (
    <div className="w-full bg-white text-xs sm:text-sm">
      <header className="bg-white p-4 border-b text-center text-[#00847e] font-bold text-sm sm:text-2xl">
        Log Entries
      </header>

      <div className="p-4 space-y-4">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-2 border-[#00847e] text-[#00847e] flex justify-between items-center p-3"
            >
              <div className="text-left">
                <p className="text-xs">Month & Year</p>
                <p className="text-base font-bold">
                  {selectedMonth} {selectedYear}
                </p>
              </div>
              <FaCalendar className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="mt-2 border p-2 rounded shadow-md z-10 bg-white max-w-[350px] sm:max-w-md w-full">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="w-full"
              captionLayout="dropdown"
              fromYear={2020}
              toYear={new Date().getFullYear()}
              required={false}
            />
          </PopoverContent>
        </Popover>

        {selectedDate && (
          <Button
            variant="outline"
            onClick={clearFilter}
            className="text-sm text-[#00847e]"
          >
            Clear Filter
          </Button>
        )}

        {loading && (
          <p className="text-center text-gray-500">Loading logs...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#00847e] text-white text-center p-2 rounded">
            <FaCalendar size={16} className="mx-auto mb-1" />
            <p className="text-sm font-bold">{totalWorkingDays}</p>
            <p className="text-[10px]">Total</p>
          </div>
          <div className="text-[#4ADE80] text-center p-2 rounded border">
            <FaCheck size={16} className="mx-auto mb-1" />
            <p className="text-sm font-bold">{successDays}</p>
            <p className="text-[10px] text-black">Success</p>
          </div>
          <div className="text-[#F87171] text-center p-2 rounded border">
            <FaUserTimes size={16} className="mx-auto mb-1" />
            <p className="text-sm font-bold">{absentDays}</p>
            <p className="text-[10px] text-black">Absent</p>
          </div>
          <div className="text-[#FBBF24] text-center p-2 rounded border">
            <FaArrowCircleRight size={16} className="mx-auto mb-1" />
            <p className="text-sm font-bold">{alertDays}</p>
            <p className="text-[10px] text-black">Alert</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 font-semibold text-gray-600 bg-gray-50 p-2 border-b text-[10px] sm:text-xs">
          <div>Date</div>
          <div className="text-center">In</div>
          <div className="text-center">Out</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {currentLogs.length > 0 ? (
          currentLogs.map((log) => {
            const { color, icon } = getStatusInfo(log.status);
            return (
              <div
                key={log.id}
                className="grid grid-cols-5 items-center gap-1 border-b px-2 py-2 text-[10px] sm:text-sm"
              >
                <div className="font-medium">{log.date}</div>
                <div className="text-center">{log.inTime || "NA"}</div>
                <div className="text-center">{log.outTime || "NA"}</div>
                <div className="flex items-center" style={{ color }}>
                  {icon}
                  <span>{log.status}</span>
                </div>
                {log.status !== "Success" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openReasonDialog(log.id)}
                    className="text-xs"
                  >
                    <FaPencilAlt color="green" />
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 mt-4">
            No logs found for selected date.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={currentPage === idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add/Edit Reason</h2>
            <input
              type="text"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter reason here..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-[#00847e] text-white" onClick={saveReason}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;
