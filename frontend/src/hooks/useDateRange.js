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
  const [endDate, setEndDate] = useState(new Date());

  function parseDateRange(dateRange) {
    if (dateRange.length > 1) {
      dateRange = dateRange.toString().split(",");
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
    } else {
      setStartDate(dateRange[0]);
      setEndDate(dateRange[0]);
    }
  }

  return {
    startDate,
    endDate,
    parseDateRange,
  };
}

export default useDateRange;
