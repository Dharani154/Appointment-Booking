import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AppointmentBooker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [adminTime, setAdminTime] = useState('');

  // Working hours configuration
  const WORKING_HOURS = {
    start: 9, // 9 AM
    end: 17,  // 5 PM
    slotDuration: 30 // 30 minutes
  };

  // Generate all possible 30-minute slots within working hours
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = WORKING_HOURS.start * 60; // Convert to minutes
    const endTime = WORKING_HOURS.end * 60;
    
    for (let time = startTime; time < endTime; time += WORKING_HOURS.slotDuration) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const displayTime = formatTime12Hour(hours, minutes);
      
      slots.push({
        time: timeString,
        display: displayTime
      });
    }
    
    return slots;
  };

  // Format time to 12-hour format
  const formatTime12Hour = (hours, minutes) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const timeSlots = generateTimeSlots();

  // Handle slot booking
  const handleSlotClick = (slotTime) => {
    if (bookedSlots.has(slotTime)) {
      // Already booked - show message
      setConfirmationMessage(`This slot (${timeSlots.find(s => s.time === slotTime)?.display}) is already booked.`);
      setTimeout(() => setConfirmationMessage(''), 3000);
      return;
    }

    // Book the slot
    setBookedSlots(prev => new Set([...prev, slotTime]));
    const displayTime = timeSlots.find(s => s.time === slotTime)?.display;
    setConfirmationMessage(`Appointment booked for ${displayTime}!`);
    setTimeout(() => setConfirmationMessage(''), 3000);
  };

  // Handle date change - clear booked slots to simulate loading new day data
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setBookedSlots(new Set()); // Clear previous bookings when changing date
    setConfirmationMessage('');
  };

  // Admin function to pre-book slots
  const handleAdminBook = () => {
    if (!adminTime || !adminTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      setConfirmationMessage('Please enter a valid time in HH:MM format (e.g., 14:00)');
      setTimeout(() => setConfirmationMessage(''), 3000);
      return;
    }

    const [hours, minutes] = adminTime.split(':').map(Number);
    
    // Check if time is within working hours
    if (hours < WORKING_HOURS.start || hours >= WORKING_HOURS.end || minutes % 30 !== 0) {
      setConfirmationMessage(`Time must be within working hours (${WORKING_HOURS.start}:00-${WORKING_HOURS.end}:00) and align with 30-minute slots`);
      setTimeout(() => setConfirmationMessage(''), 3000);
      return;
    }

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    if (bookedSlots.has(timeString)) {
      setConfirmationMessage('This slot is already booked');
      setTimeout(() => setConfirmationMessage(''), 3000);
      return;
    }

    setBookedSlots(prev => new Set([...prev, timeString]));
    const displayTime = formatTime12Hour(hours, minutes);
    setConfirmationMessage(`Admin: Pre-booked slot for ${displayTime}`);
    setAdminTime('');
    setTimeout(() => setConfirmationMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Appointment Booking System
          </h1>
          <p className="text-gray-600">Book your 30-minute appointment slot</p>
        </div>

        {/* Date Picker */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Select Date</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Working Hours Display */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Working Hours</h3>
          </div>
          <p className="text-gray-700">
            Available from {formatTime12Hour(WORKING_HOURS.start, 0)} to {formatTime12Hour(WORKING_HOURS.end, 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Confirmation Message */}
        {confirmationMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{confirmationMessage}</p>
            </div>
          </div>
        )}

        {/* Available Slots */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Time Slots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots.map((slot) => {
              const isBooked = bookedSlots.has(slot.time);
              return (
                <button
                  key={slot.time}
                  onClick={() => handleSlotClick(slot.time)}
                  disabled={isBooked}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isBooked 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-2 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md'
                    }
                  `}
                >
                  {slot.display}
                  {isBooked && (
                    <div className="text-xs mt-1 text-gray-400">Booked</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Admin: Pre-book Slots</h3>
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (24-hour format)
              </label>
              <input
                type="text"
                value={adminTime}
                onChange={(e) => setAdminTime(e.target.value)}
                placeholder="e.g., 14:00"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAdminBook}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              Pre-book Slot
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter time in HH:MM format (e.g., 14:00 for 2:00 PM). Must align with 30-minute intervals.
          </p>
        </div>

        {/* Booking Summary */}
        {bookedSlots.size > 0 && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Booked Appointments ({bookedSlots.size})
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(bookedSlots).map(time => {
                const slot = timeSlots.find(s => s.time === time);
                return (
                  <span key={time} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm">
                    {slot?.display}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooker;
