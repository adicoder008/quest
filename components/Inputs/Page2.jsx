'use client'
import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import { IoMdCalendar } from 'react-icons/io';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file
import { format } from 'date-fns';

const Page2 = ({ formData, updateFormData }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load saved dates from localStorage
  useEffect(() => {
    const savedStartDate = localStorage.getItem('startDate');
    const savedEndDate = localStorage.getItem('endDate');
    
    if (savedStartDate && savedEndDate) {
      setDateRange({
        startDate: new Date(savedStartDate),
        endDate: new Date(savedEndDate),
        key: 'selection',
      });
    }
  }, []);

  // Save dates to localStorage and update formData
  const saveDates = (startDate, endDate) => {
    localStorage.setItem('startDate', startDate.toISOString());
    localStorage.setItem('endDate', endDate.toISOString());

    // Update formData in the parent component
    updateFormData({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  // Handle date range changes
  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange({ startDate, endDate, key: 'selection' });
    saveDates(startDate, endDate);
  };

  // Toggle calendar visibility
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  // Format display dates
  const formatDate = (date) => format(date, 'dd/MM/yyyy');

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Custom CSS for react-date-range */}
      <style>
        {`
          .rdrDayInPreview,
          .rdrDayStartPreview,
          .rdrDayEndPreview,
          .rdrDayInRange,
          .rdrDayStartPreview,
          .rdrDayEndPreview,
          .rdrDayStartOfWeek,
          .rdrDayEndOfWeek,
          .rdrDayStartOfMonth,
          .rdrDayEndOfMonth,
          .rdrDayStartOfYear,
          .rdrDayEndOfYear {
            background-color:rgb(255, 255, 255) !important;
            border-color: #f86f0a !important;
            text-decoration: none !important;
          }

          .rdrDay:hover .rdrDayNumber span {
            background-color: #f86f0a !important;
            color: rgb(0,0,0) !important;
          }

          .rdrDaySelected .rdrDayNumber span {
            background-color: #f86f0a !important;
          }

          .rdrInRange {
            background-color: rgba(248, 111, 10, 0.2) !important;
            color: rgb(0,0,0) !important
          }
          .rdrDefinedRangesWrapper {
           display: none !important;
            }
            
        `}
      </style>

      {/* Calendar Toggle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <button
            onClick={toggleCalendar}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 rounded-md text-lg hover:bg-gray-50 transition-colors"
          >
            <IoMdCalendar className="text-gray-500 w-5 h-5" />
            <span className="font-medium">Select Travel Dates</span>
          </button>

          {/* Calendar Popup */}
          {isCalendarOpen && (
            <div className="absolute z-10 mt-2 bg-white shadow-xl rounded-lg border p-4 left-1/2 transform -translate-x-1/2">
              <DateRangePicker
                ranges={[dateRange]}
                onChange={handleDateChange}
                months={2} // Show 2 months
                direction="horizontal"
              />
            </div>
          )}
        </div>
      </div>

      {/* Date Display Section */}
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Start Date</h3>
          <p className="text-gray-700">{formatDate(dateRange.startDate)}</p>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">End Date</h3>
          <p className="text-gray-700">{formatDate(dateRange.endDate)}</p>
        </div>
      </div>
    </div>
  );
};

export default Page2;