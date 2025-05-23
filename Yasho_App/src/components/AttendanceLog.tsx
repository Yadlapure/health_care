import React, { useState } from "react";
import {
  FaCalendar,
  FaUserTimes,
  FaHome,
  FaUser,
  FaCheck,
  FaArrowCircleRight,
  FaClock,
} from "react-icons/fa";
import { format } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "../components/ui/calendar";

// Types
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

// Sample logs
const initialMockLogs: LogEntry[] = [
  {
    id: "1",
    date: "21 May",
    inTime: "13:58",
    status: "Alert",
    location: "Office",
  },
  { id: "2", date: "20 May", status: "Absent" },
  {
    id: "3",
    date: "19 May",
    inTime: "13:46",
    outTime: "17:30",
    status: "Success",
    location: "Office",
  },
  { id: "4", date: "18 May", status: "Weekend" },
  {
    id: "5",
    date: "17 May",
    inTime: "15:04",
    outTime: "18:45",
    status: "Success",
    location: "Office",
  },
  {
    id: "6",
    date: "16 May",
    inTime: "05:42",
    outTime: "14:30",
    status: "Success",
    location: "Office",
  },
];

/* ...imports remain the same... */

const AttendanceLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(initialMockLogs);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), "yyyy"));
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState<string>("");

  const totalWorkingDays = 21;
  const successDays = logs.filter((log) => log.status === "Success").length;
  const absentDays = logs.filter((log) => log.status === "Absent").length;
  const alertDays = logs.filter((log) => log.status === "Alert" || log.status === "NC").length;

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

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setSelectedMonth(format(date, "MMMM"));
      setSelectedYear(format(date, "yyyy"));
      setIsCalendarOpen(false);
    }
  };

  const getStatusInfo = (status: AttendanceStatus) => {
    switch (status) {
      case "Success":
        return { color: "#4ADE80", icon: <FaCheck className="mr-1" /> };
      case "Absent":
        return { color: "#F87171", icon: <FaUserTimes className="mr-1" /> };
      case "Alert":
      case "NC":
        return { color: "#FBBF24", icon: <FaArrowCircleRight className="mr-1" /> };
      case "Weekend":
        return { color: "#94A3B8", icon: <FaCalendar className="mr-1" /> };
      default:
        return { color: "#8E9196", icon: <FaCalendar className="mr-1" /> };
    }
  };

  return (
    <div className="w-full bg-white text-xs sm:text-sm">
      <header className="bg-white p-4 border-b text-center text-[#00847e] font-bold text-xl sm:text-2xl">
        Log Entries
      </header>

      <div className="p-4 space-y-4">
        {/* Calendar Picker */}
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
          <PopoverContent className="mt-2 border p-2 rounded shadow-md z-10 bg-white max-w-[350px]">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>

        {/* Summary Cards in One Compact Row */}
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

        {/* Column Headers */}
        <div className="grid grid-cols-6 gap-1 font-semibold text-gray-600 bg-gray-50 p-2 border-b text-[10px] sm:text-xs">
          <div>Date</div>
          <div>Loc</div>
          <div className="text-center">In</div>
          <div className="text-center">Out</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* Log Rows */}
        {logs.map((log) => {
          const { color, icon } = getStatusInfo(log.status);
          return (
            <div
              key={log.id}
              className="grid grid-cols-6 items-center gap-1 border-b px-2 py-2 text-[10px] sm:text-sm"
            >
              <div className="font-medium">{log.date}</div>
              <div className="truncate text-green-700">
                {log.location || "NA"}
              </div>
              <div className="text-center">{log.inTime || "NA"}</div>
              <div className="text-center">{log.outTime || "NA"}</div>
              <div className="flex items-center" style={{ color }}>
                {icon}
                <span>{log.status}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openReasonDialog(log.id)}
                className="text-xs"
              >
                ✏️
              </Button>
            </div>
          );
        })}
      </div>

      {/* Reason Dialog */}
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

