/* eslint-disable no-unused-vars */
function getWeekDayShort(dateobj) {
  return dateobj.toLocaleDateString("en-US", {weekday: "short"});
}
function getWeekDayLong(dateobj) {
  return dateobj.toLocaleDateString("en-US", {weekday: "long"});
}
function getMonthShort(dateobj) {
  return dateobj.toLocaleDateString("en-US", {month: "short"});
}
function getDaySuffix(num) {
  if (9 < num < 19) return "th";
  if (num % 10 === 1) return "st";
  if (num % 10 === 2) return "nd";
  if (num % 10 === 3) return "rd";
  return "th";
}
export function getYearMonthDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d)) return "N/A";

  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return (
    d.getFullYear() +
    "/" +
    (mm < 10 ? "0" : "") +
    mm +
    "/" +
    (dd < 10 ? "0" : "") +
    dd
  );
}
export function getHourMinuteSecond(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d)) return "N/A";

  return (
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2)
  );
}

export function getLocalDateWithTimezone(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d)) return "N/A";

  const datelen = date.length;
  return d.toLocaleString() + ` (${date.substring(datelen - 6)})`;
}

export default function dateFormatter(date, short = false) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d)) return "N/A";
  const now = new Date();

  var timeString =
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2);

  // const year = d.getFullYear();
  // const day = d.getDate();

  // if (now.getUTCFullYear() === year)
  //     return `${getMonthShort(d)} ${day}${getDaySuffix(day)}, ${getWeekDayShort(d)}, ${timeString}`

  var dateString =
    d.getFullYear() +
    "/" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    timeString;

  return dateString;
}
