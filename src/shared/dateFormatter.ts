export function dateToSlugTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

export function slugTimestampToDate(dateString: string): Date | null {
  const parts = dateString.split("-");
  if (parts.length !== 6) {
    return null;
  }
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10) - 1; // JavaScript months are zero-indexed
  const day = parseInt(parts[2]!, 10);
  const hours = parseInt(parts[3]!, 10);
  const minutes = parseInt(parts[4]!, 10);
  const seconds = parseInt(parts[5]!, 10);

  const date = new Date(year, month, day, hours, minutes, seconds);

  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }

  return date;
}

export function dateToReadableString(date: Date, dayOnly = false) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return dayOnly
    ? `${day}`
    : `${month} ${day}, ${year}`;
}

export function dateToPostTimestamp(date: Date): string {
  const day = date.getDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const hour = date.getHours();
  const time = `${hour % 12 || 12}.${String(date.getMinutes()).padStart(2, "0")}${hour < 12 ? "am" : "pm"}`;

  return `${month} ${day}${suffix}, ${date.getFullYear()} at ${time}`;
}

export function makeDBTimestamp(date: Date): string {
  // Should not need to do this
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const dbTimestamp = new Date(date.getTime() - timezoneOffset).toISOString();
  return dbTimestamp;
}
