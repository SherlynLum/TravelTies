const validateCardTime = ({startDate, startTime, endDate, endTime}) => {
    if (startDate && endDate) {
        if (endDate < startDate) {
            return "End date must be after start date";
        }
        if (startDate === endDate && startTime && endTime && endTime < startTime) {
            return "End time must be after start time";
        }
    }

    return null;
}

module.exports = {
    validateCardTime
}