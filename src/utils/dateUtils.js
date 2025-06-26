import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isValid,
  getDay,
} from "date-fns";

export const generateCalendarGrid = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = [];
  let currentDate = calendarStart;

  while (currentDate <= calendarEnd) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return days;
};

export const isCurrentMonth = (date, currentMonth) => {
  return isSameMonth(date, currentMonth);
};

export const isTodayDate = (date) => {
  return isToday(date);
};

export const isSameDayDate = (date1, date2) => {
  return isSameDay(date1, date2);
};

export const formatDate = (date, formatString = "yyyy-MM-dd") => {
  return format(date, formatString);
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const combineDateAndTime = (dateString, timeString) => {
  return parseISO(`${dateString}T${timeString}:00`);
};

export const generateRecurringDates = (event, startDate, endDate) => {
  const dates = [];
  const eventDate = parseISO(event.date);
  if (!isValid(eventDate)) return dates;

  let currentDate = new Date(eventDate);
  const maxIterations = 365;
  let iterations = 0;

  while (currentDate <= endDate && iterations < maxIterations) {
    if (currentDate >= startDate) {
      dates.push(new Date(currentDate));
    }

    switch (event.recurrence) {
      case "daily":
        currentDate = addDays(currentDate, 1);
        break;
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
      case "yearly":
        currentDate = addYears(currentDate, 1);
        break;
      case "custom":
        if (event.customInterval && event.customUnit) {
          switch (event.customUnit) {
            case "days":
              currentDate = addDays(currentDate, event.customInterval);
              break;
            case "weeks":
              currentDate = addWeeks(currentDate, event.customInterval);
              break;
            case "months":
              currentDate = addMonths(currentDate, event.customInterval);
              break;
            default:
              return dates;
          }
        } else {
          return dates;
        }
        break;
      default:
        return dates;
    }

    iterations++;
  }

  return dates;
};

export const detectEventConflicts = (newEvent, existingEvents) => {
  const conflicts = [];
  const newEventDateTime = combineDateAndTime(newEvent.date, newEvent.time);

  for (const event of existingEvents) {
    if (event.id === newEvent.id) continue;
    const eventDateTime = combineDateAndTime(event.date, event.time);
    if (isSameDay(newEventDateTime, eventDateTime)) {
      if (newEvent.time === event.time) {
        conflicts.push(event);
      }
    }
  }

  return conflicts;
};

export const getDayName = (dayIndex) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayIndex];
};

export const getMonthName = (date) => {
  return format(date, "MMMM yyyy");
};

export const getEventsForDate = (events, date) => {
  return events.filter((event) => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, date);
  });
};

export const sortEventsByTime = (events) => {
  return [...events].sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  });
};
