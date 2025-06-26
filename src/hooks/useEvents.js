import { useState, useMemo, useCallback } from "react";
import { useEventStorage } from "./useLocalStorage.js";
import {
  generateRecurringDates,
  detectEventConflicts,
  getEventsForDate,
  sortEventsByTime,
  isSameDayDate,
} from "../utils/dateUtils.js";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";

export const useEvents = () => {
  const [events, addEvent, updateEvent, deleteEvent, clearAllEvents] = useEventStorage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  const allEventInstances = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const instances = [];

    events.forEach((event) => {
      if (event.recurrence && event.recurrence !== "none") {
        const recurringDates = generateRecurringDates(event, monthStart, monthEnd);
        recurringDates.forEach((date) => {
          instances.push({
            ...event,
            date: date.toISOString().split("T")[0],
            isRecurring: true,
            originalId: event.id,
          });
        });
      } else {
        const eventDate = parseISO(event.date);
        if (eventDate >= monthStart && eventDate <= monthEnd) {
          instances.push({
            ...event,
            isRecurring: false,
          });
        }
      }
    });

    return instances;
  }, [events, currentDate]);

  const filteredEvents = useMemo(() => {
    return allEventInstances.filter((event) => {
      const matchesSearch = searchTerm
        ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allEventInstances, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(events.map((event) => event.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [events]);

  const handleAddEvent = useCallback(
    (eventData) => {
      const conflicts = detectEventConflicts(eventData, events);
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
          message: `Conflict detected with ${conflicts.length} existing event(s)`,
        };
      }

      const newEvent = addEvent(eventData);
      return { success: true, event: newEvent };
    },
    [events, addEvent]
  );

  const handleUpdateEvent = useCallback(
    (eventId, updates) => {
      const originalEvent = events.find((e) => e.id === eventId);
      if (!originalEvent) {
        return { success: false, message: "Event not found" };
      }

      const updatedEvent = { ...originalEvent, ...updates };
      const conflicts = detectEventConflicts(updatedEvent, events);

      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
          message: `Conflict detected with ${conflicts.length} existing event(s)`,
        };
      }

      updateEvent(eventId, updates);
      return { success: true };
    },
    [events, updateEvent]
  );

  const handleDeleteEvent = useCallback(
    (eventId) => {
      deleteEvent(eventId);
      return { success: true };
    },
    [deleteEvent]
  );

  const moveEvent = useCallback(
    (eventId, newDate) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return { success: false, message: "Event not found" };

      const updatedEvent = {
        ...event,
        date: newDate.toISOString().split("T")[0],
      };

      const conflicts = detectEventConflicts(updatedEvent, events);
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
          message: `Cannot move event: conflict with existing event(s)`,
        };
      }

      updateEvent(eventId, { date: updatedEvent.date });
      return { success: true };
    },
    [events, updateEvent]
  );

  const getEventsForDay = useCallback(
    (date) => {
      const dayEvents = getEventsForDate(filteredEvents, date);
      return sortEventsByTime(dayEvents);
    },
    [filteredEvents]
  );

  const hasEventsOnDate = useCallback(
    (date) => {
      return filteredEvents.some((event) => {
        const eventDate = parseISO(event.date);
        return isSameDayDate(eventDate, date);
      });
    },
    [filteredEvents]
  );

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date) => {
    setCurrentDate(new Date(date));
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
  }, []);

  const statistics = useMemo(() => {
    const total = events.length;
    const thisMonth = allEventInstances.length;
    const recurring = events.filter(
      (e) => e.recurrence && e.recurrence !== "none"
    ).length;
    const byCategory = {};

    events.forEach((event) => {
      const cat = event.category || "uncategorized";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      total,
      thisMonth,
      recurring,
      byCategory,
    };
  }, [events, allEventInstances]);

  return {
    events: filteredEvents,
    allEvents: events,
    currentDate,
    searchTerm,
    selectedCategory,
    categories,
    statistics,
    addEvent: handleAddEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    moveEvent,
    clearAllEvents,
    getEventsForDay,
    hasEventsOnDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    goToDate,
    handleSearch,
    handleCategoryFilter,
    clearFilters,
  };
};
