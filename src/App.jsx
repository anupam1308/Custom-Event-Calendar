import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Calendar, {
  CalendarHeader,
  CalendarLegend,
} from "./components/Calendar.jsx";
import EventForm from "./components/EventForm.jsx";
import Modal, { ConfirmModal, AlertModal } from "./components/Modal.jsx";
import { EventList, EventSummary } from "./components/EventCard.jsx";
import { useEvents } from "./hooks/useEvents.js";
import { formatDate } from "./utils/dateUtils.js";


function App() {
  const {
    events,
    currentDate,
    searchTerm,
    selectedCategory,
    categories,
    statistics,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    getEventsForDay,
    hasEventsOnDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    handleSearch,
    handleCategoryFilter,
  } = useEvents();

  
  const [eventFormModal, setEventFormModal] = useState({
    isOpen: false,
    event: null,
    selectedDate: new Date(),
  });
  const [eventDetailsModal, setEventDetailsModal] = useState({
    isOpen: false,
    event: null,
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    event: null,
  });
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  
  const handleDateClick = useCallback((date) => {
    setEventFormModal({
      isOpen: true,
      event: null,
      selectedDate: date,
    });
  }, []);

 
  const handleEventClick = useCallback((event) => {
    setEventDetailsModal({
      isOpen: true,
      event,
    });
  }, []);

 
  const handleEventEdit = useCallback((event) => {
    setEventFormModal({
      isOpen: true,
      event,
      selectedDate: new Date(event.date),
    });
    setEventDetailsModal({ isOpen: false, event: null });
  }, []);

 
  const handleEventDelete = useCallback((event) => {
    setDeleteConfirmModal({
      isOpen: true,
      event,
    });
    setEventDetailsModal({ isOpen: false, event: null });
  }, []);

  
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        const result = eventFormModal.event
          ? await updateEvent(eventFormModal.event.id, formData)
          : await addEvent(formData);

        if (result.success) {
          setEventFormModal({
            isOpen: false,
            event: null,
            selectedDate: new Date(),
          });
          setAlertModal({
            isOpen: true,
            type: "success",
            title: "Success",
            message: eventFormModal.event
              ? "Event updated successfully!"
              : "Event created successfully!",
          });
        } else {
         
          setAlertModal({
            isOpen: true,
            type: "warning",
            title: "Schedule Conflict",
            message: result.message,
          });
        }
      } catch (error) {
        setAlertModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Something went wrong. Please try again.",
        });
      }
    },
    [eventFormModal.event, addEvent, updateEvent],
  );

 
  const handleEventMove = useCallback(
    async (eventId, newDate) => {
      try {
        const result = await moveEvent(eventId, newDate);
        if (result.success) {
          setAlertModal({
            isOpen: true,
            type: "success",
            title: "Event Moved",
            message: `Event moved to ${formatDate(newDate, "MMM d, yyyy")}`,
          });
        } else {
          setAlertModal({
            isOpen: true,
            type: "warning",
            title: "Cannot Move Event",
            message: result.message,
          });
        }
      } catch (error) {
        setAlertModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Failed to move event. Please try again.",
        });
      }
    },
    [moveEvent],
  );


  const handleConfirmedDelete = useCallback(async () => {
    try {
      const result = await deleteEvent(deleteConfirmModal.event.id);
      if (result.success) {
        setDeleteConfirmModal({ isOpen: false, event: null });
        setAlertModal({
          isOpen: true,
          type: "success",
          title: "Event Deleted",
          message: "Event has been successfully deleted.",
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to delete event. Please try again.",
      });
    }
  }, [deleteConfirmModal.event, deleteEvent]);

 
  const todayEvents = getEventsForDay(new Date());

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <header className="glass-card relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden group interactive-hover"
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                  <svg
                    className="w-6 h-6 text-white relative z-10"
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
                </div>
                <div>
                  <h1 className="text-2xl font-bold glow-text">
                    Event Calendar
                  </h1>
                  <p className="text-sm text-gray-700 font-medium">
                    Manage your schedule beautifully
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDateClick(new Date())}
                className="btn btn-primary relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  className="w-5 h-5 mr-2 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="relative z-10">Add Event</span>
              </button>
            </div>
          </div>

         
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute top-8 right-8 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-4 left-1/3 w-12 h-12 bg-pink-400/20 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </header>

        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
            <div className="lg:col-span-3 space-y-6">
             
              <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToday={goToToday}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryFilter}
                categories={categories}
                statistics={statistics}
              />

             
              <Calendar
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onEventEdit={handleEventEdit}
                onEventDelete={handleEventDelete}
                onEventMove={handleEventMove}
                getEventsForDay={getEventsForDay}
                hasEventsOnDate={hasEventsOnDate}
              />
            </div>

          
            <div className="space-y-6">
           
              <div className="glass-card p-6 interactive-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Today's Events
                  </h3>
                </div>
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <EventSummary
                        key={`${event.id}-${event.date}`}
                        event={event}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-800 font-semibold mb-3">
                      No events today
                    </p>
                    <button
                      onClick={() => handleDateClick(new Date())}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Add an event
                    </button>
                  </div>
                )}
              </div>

            
              <div className="glass-card p-6 interactive-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Statistics
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
                      <span className="text-gray-800 font-semibold">
                        Total Events
                      </span>
                    </div>
                    <span className="font-bold text-blue-600 text-xl">
                      {statistics.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg"></div>
                      <span className="text-gray-800 font-semibold">
                        This Month
                      </span>
                    </div>
                    <span className="font-bold text-green-600 text-xl">
                      {statistics.thisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-purple-200 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg"></div>
                      <span className="text-gray-800 font-semibold">
                        Recurring
                      </span>
                    </div>
                    <span className="font-bold text-purple-600 text-xl">
                      {statistics.recurring}
                    </span>
                  </div>
                </div>
              </div>

            
              <CalendarLegend categories={categories} />
            </div>
          </div>
        </main>

      
        <Modal
          isOpen={eventFormModal.isOpen}
          onClose={() =>
            setEventFormModal({
              isOpen: false,
              event: null,
              selectedDate: new Date(),
            })
          }
          title={eventFormModal.event ? "Edit Event" : "Create New Event"}
          size="lg"
        >
          <EventForm
            event={eventFormModal.event}
            selectedDate={eventFormModal.selectedDate}
            onSubmit={handleFormSubmit}
            onCancel={() =>
              setEventFormModal({
                isOpen: false,
                event: null,
                selectedDate: new Date(),
              })
            }
          />
        </Modal>

        
        <Modal
          isOpen={eventDetailsModal.isOpen}
          onClose={() => setEventDetailsModal({ isOpen: false, event: null })}
          title="Event Details"
        >
          {eventDetailsModal.event && (
            <div className="space-y-4">
              <EventSummary event={eventDetailsModal.event} />
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEventEdit(eventDetailsModal.event)}
                  className="btn btn-secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleEventDelete(eventDetailsModal.event)}
                  className="btn btn-danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </Modal>

       
        <ConfirmModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={() => setDeleteConfirmModal({ isOpen: false, event: null })}
          onConfirm={handleConfirmedDelete}
          title="Delete Event"
          message={`Are you sure you want to delete "${deleteConfirmModal.event?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />

        
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() =>
            setAlertModal({
              isOpen: false,
              type: "info",
              title: "",
              message: "",
            })
          }
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
        />

        
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 max-w-xs shadow-2xl animate-bounce-subtle">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">💡</span>
              </div>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                Tap a date to add events, tap events to view details
              </p>
            </div>
          </div>
        </div>


        <div className="fixed bottom-20 right-4 md:hidden z-50">
          <button
            onClick={() => handleDateClick(new Date())}
            className="w-16 h-16 rounded-full text-white font-bold text-3xl shadow-2xl interactive-hover"
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
              boxShadow: "0 15px 35px rgba(255, 107, 107, 0.4)",
            }}
          >
            +
          </button>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
