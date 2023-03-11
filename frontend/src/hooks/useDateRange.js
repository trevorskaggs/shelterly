import { useState } from "react";
import moment from "moment";

/**
 * useDateRange hook to parse an array of dates and set the start and end dates
 *
 * @returns {Object} output
 * @returns {Date} output.startDate
 * @returns {Date} output.endDate
 * @returns {(dateRange: [start: Date, end?: Date]) => void} output.parseDateRange
 */
function useDateRange() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  function parseDateRange(dateRange) {
    if (dateRange.length > 1) {
      dateRange = dateRange.toString().split(",");
      setStartDate(moment(dateRange[0]).format("YYYY-MM-DD"));
      setEndDate(moment(dateRange[1]).format("YYYY-MM-DD"));
    } else {
      setStartDate(moment(dateRange[0]).format("YYYY-MM-DD"));
      setEndDate(moment(dateRange[0]).format("YYYY-MM-DD"));
    }
  }

  return {
    startDate,
    endDate,
    parseDateRange,
  };
}

export default useDateRange;
