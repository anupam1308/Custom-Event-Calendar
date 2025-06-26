import React, { useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard.jsx";
import {
  generateCalendarGrid,
  isCurrentMonth,
  isTodayDate,
  getDayName,
  getMonthName,
} from "../utils/dateUtils.js";

const Calendar = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventMove,
  getEventsForDay,
  hasEventsOnDate,
}) => {
  const [draggedEventId, setDraggedEventId] = useState(null);
  const calendarDays = generateCalendarGrid(currentDate);

  const CalendarDay = ({ date }) => {
    const dayEvents = getEventsForDay(date);
    const isToday = isTodayDate(date);
    const isCurrentMonthDay = isCurrentMonth(date, currentDate);
    const hasEvents = hasEventsOnDate(date);

    const [{ isOver, canDrop }, drop] = useDrop(
      () => ({
        accept: "event",
        drop: (item) => {
          if (item.id !== draggedEventId) {
            onEventMove(item.id, date);
          }
          setDraggedEventId(null);
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      }),
      [date, draggedEventId, onEventMove],
    );

    const handleDateClick = useCallback(() => {
      onDateClick(date);
    }, [date]);

    const handleEventClick = useCallback(
      (event) => {
        onEventClick(event);
      },
      [onEventClick],
    );

    const handleEventEdit = useCallback(
      (event) => {
        onEventEdit(event);
      },
      [onEventEdit],
    );

    const handleEventDelete = useCallback(
      (event) => {
        onEventDelete(event);
      },
      [onEventDelete],
    );

    let dayClasses = "calendar-day";
    if (!isCurrentMonthDay) dayClasses += " other-month";
    if (isToday) dayClasses += " today";
    if (hasEvents) dayClasses += " has-events";
    if (isOver && canDrop) dayClasses += " drag-over";

    return (
      <div ref={drop} className={dayClasses} onClick={handleDateClick}>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              isToday
                ? "text-primary-700"
                : isCurrentMonthDay
                ? "text-gray-900"
                : "text-gray-400"
            }`}
          >
            {date.getDate()}
          </span>
          {isToday && (
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          )}
        </div>

        <div className="space-y-1">
          {dayEvents.map((event, index) => {
            if (index >= 3) {
              if (index === 3) {
                return (
                  <div
                    key="more"
                    className="text-xs text-gray-500 font-medium px-1"
                  >
                    +{dayEvents.length - 3} more
                  </div>
                );
              }
              return null;
            }

            return (
              <EventCard
                key={`${event.id}-${event.date}`}
                event={event}
                onClick={handleEventClick}
                onEdit={handleEventEdit}
                onDelete={handleEventDelete}
                isDraggable={true}
                size="sm"
              />
            );
          })}
        </div>

        {isOver && canDrop && (
          <div className="absolute inset-0 bg-primary-100 bg-opacity-50 border-2 border-primary-400 border-dashed rounded-lg pointer-events-none"></div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-calendar overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {getDayName(i)}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((date, index) => (
          <CalendarDay key={index} date={date} />
        ))}
      </div>

      <div className="md:hidden p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Tap a date to add an event, or tap an event to edit it
        </p>
      </div>
    </div>
  );
};

export const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  searchTerm,
  onSearch,
  selectedCategory,
  onCategoryChange,
  categories,
  statistics,
}) => {
  return (
    <div className="header-nav">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            {getMonthName(currentDate)}
          </h1>

          <button
            onClick={onNextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={onToday}
            className="ml-4 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search events..."
            className="search-input pl-10"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all"
                ? "All Categories"
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        <div className="text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <span className="font-bold text-gray-800">
            {statistics.thisMonth}
          </span>
          <span className="text-gray-600 font-medium"> events this month</span>
        </div>
      </div>
    </div>
  );
};

export const CalendarLegend = ({ categories }) => {
  const categoryColors = {
    work: "bg-blue-500",
    personal: "bg-green-500",
    meeting: "bg-purple-500",
    deadline: "bg-red-500",
    other: "bg-gray-500",
  };

  const filteredCategories = categories.filter((cat) => cat !== "all");

  if (filteredCategories.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
      <div className="flex flex-wrap gap-3">
        {filteredCategories.map((category) => (
          <div key={category} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                categoryColors[category] || "bg-gray-500"
              }`}
            ></div>
            <span className="text-sm text-gray-700 capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
 