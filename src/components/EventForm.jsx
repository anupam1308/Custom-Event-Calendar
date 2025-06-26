import React, { useState, useEffect } from "react";
import { formatDate } from "../utils/dateUtils.js";

const EventForm = ({
  event = null,
  selectedDate = new Date(),
  onSubmit,
  onCancel,
  conflicts = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: formatDate(selectedDate),
    time: "09:00",
    description: "",
    category: "other",
    recurrence: "none",
    customInterval: 1,
    customUnit: "days",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        date: event.date || formatDate(selectedDate),
        time: event.time || "09:00",
        description: event.description || "",
        category: event.category || "other",
        recurrence: event.recurrence || "none",
        customInterval: event.customInterval || 1,
        customUnit: event.customUnit || "days",
      });
    }
  }, [event, selectedDate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.date = "Cannot create events in the past";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (formData.recurrence === "custom") {
      if (!formData.customInterval || formData.customInterval < 1) {
        newErrors.customInterval = "Interval must be at least 1";
      }
      if (!formData.customUnit) {
        newErrors.customUnit = "Unit is required for custom recurrence";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const categories = [
    { value: "work", label: "Work", color: "bg-blue-500" },
    { value: "personal", label: "Personal", color: "bg-green-500" },
    { value: "meeting", label: "Meeting", color: "bg-purple-500" },
    { value: "deadline", label: "Deadline", color: "bg-red-500" },
    { value: "other", label: "Other", color: "bg-gray-500" },
  ];

  const recurrenceOptions = [
    { value: "none", label: "No recurrence" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "custom", label: "Custom" },
  ];

  const customUnits = [
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800">
                Schedule Conflict Detected
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                This event conflicts with {conflicts.length} existing event(s):
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                {conflicts.map((conflict) => (
                  <li key={conflict.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    {conflict.title} at {conflict.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`form-input ${errors.title ? "border-red-500" : ""}`}
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter event title"
          maxLength={100}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`form-input ${errors.date ? "border-red-500" : ""}`}
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            className={`form-input ${errors.time ? "border-red-500" : ""}`}
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
          />
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          className="form-input resize-none"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter event description (optional)"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      <div>
        <label className="form-label">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <label
              key={category.value}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.category === category.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={formData.category === category.value}
                onChange={(e) => handleChange("category", e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded ${category.color}`}></div>
              <span className="text-sm font-medium">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Recurrence</label>
        <select
          className="form-input"
          value={formData.recurrence}
          onChange={(e) => handleChange("recurrence", e.target.value)}
        >
          {recurrenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {formData.recurrence === "custom" && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Custom Recurrence</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Every</label>
              <input
                type="number"
                min="1"
                max="365"
                className={`form-input ${
                  errors.customInterval ? "border-red-500" : ""
                }`}
                value={formData.customInterval}
                onChange={(e) =>
                  handleChange("customInterval", parseInt(e.target.value))
                }
              />
              {errors.customInterval && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.customInterval}
                </p>
              )}
            </div>
            <div>
              <label className="form-label">Unit</label>
              <select
                className={`form-input ${
                  errors.customUnit ? "border-red-500" : ""
                }`}
                value={formData.customUnit}
                onChange={(e) => handleChange("customUnit", e.target.value)}
              >
                {customUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {errors.customUnit && (
                <p className="text-red-500 text-sm mt-1">{errors.customUnit}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </div>
          ) : event ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
