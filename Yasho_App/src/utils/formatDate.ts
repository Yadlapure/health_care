export const formatDate = (dateString?: string) => {
  if (!dateString) return "Not recorded";

  const utcDateString = dateString.endsWith("Z")
    ? dateString
    : dateString + "Z";
  const date = new Date(utcDateString);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
