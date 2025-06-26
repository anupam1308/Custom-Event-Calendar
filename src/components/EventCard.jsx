import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { formatTime } from "../utils/dateUtils.js";

const EventCard = ({
  event,
  onClick,
  onEdit,
  onDelete,
  isDraggable = true,
  size = "sm",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "event",
      item: { id: event.id, event },
      canDrag: isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [event, isDraggable],
  );

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!isDragging && onClick) {
      onClick(event);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onEdit) onEdit(event);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDelete) onDelete(event);
  };

  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-2 px-3",
    lg: "text-base py-3 px-4",
  };

  const categoryClass = `event-card ${event.category || "other"}`;
  const dragClass = isDragging ? "dragging" : "";

  return (
    <div
      ref={isDraggable ? drag : null}
      className={`${categoryClass} ${dragClass} ${sizeClasses[size]} relative group`}
      onClick={handleCardClick}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? "grab" : "pointer",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{event.title}</div>
          {event.time && (
            <div className="text-xs opacity-90 mt-0.5">
              {formatTime(event.time)}
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="relative ml-2">
            <button
              onClick={handleMenuClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black hover:bg-opacity-20 rounded p-1"
              aria-label="Event options"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {event.isRecurring && (
        <div className="absolute top-1 right-1">
          <svg
            className="w-3 h-3 text-white opacity-75"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      {event.description && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 max-w-xs shadow-lg">
            {event.description}
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EventList = ({ events, onEventClick, onEventEdit, onEventDelete }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p>No events found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventCard
          key={`${event.id}-${event.date}`}
          event={event}
          onClick={onEventClick}
          onEdit={onEventEdit}
          onDelete={onEventDelete}
          isDraggable={false}
          size="md"
        />
      ))}
    </div>
  );
};

export const EventSummary = ({ event }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.category || "other"}`}></div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
        {event.time && (
          <p className="text-sm text-gray-600">{formatTime(event.time)}</p>
        )}
        {event.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
        {event.isRecurring && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Recurring
          </span>
        )}
      </div>
    </div>
  );
};

export default EventCard;
