import { useState } from 'react';

/**
 * useDateRange hook to parse an array of dates and set the start and end dates
 *
 * @returns {Object} output
 * @returns {Date} output.startDate
 * @returns {Date} output.endDate
 * @returns {(dateRange: [start: Date, end?: Date]) => void} output.parseDateRange
 */
function useDateRange() {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  function parseDateRange(dateRange) {
    if (Array.isArray(dateRange) && dateRange.length) {
      if (dateRange.length > 1) {
        setStartDate(dateRange[0]);
        setEndDate(dateRange[1]);
      } else {
        setStartDate(dateRange[0]);
        setEndDate(dateRange[0]);
      }
    }
  }

  return {
    startDate,
    endDate,
    parseDateRange,
  };
}

export default useDateRange;
