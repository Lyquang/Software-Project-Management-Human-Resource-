export const formatToLocalTime = (utcString) => {
  if (!utcString) return "-";
  try {
    let date;
    if (utcString.includes('T')) {
      date = new Date(utcString);
    } else {
      date = new Date(utcString.replace(" ", "T") + "Z");
    }
    return date.toLocaleString("en-GB", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return utcString;
  }
};

export const getStatusFromRecord = (record) => {
  if (!record.checkIn) return "ABSENT";
  if (record.checkIn && !record.checkOut) return "PRESENT";
  return "COMPLETED";
};

export const getDurationColor = (duration) => {
  if (!duration || duration === "-") return "text-gray-500";
  const hours = parseFloat(duration);
  if (hours >= 8) return "text-green-600";
  if (hours >= 6) return "text-orange-600";
  return "text-red-600";
};