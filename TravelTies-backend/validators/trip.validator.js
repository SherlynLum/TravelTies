const validateTripDates = ({startDate, endDate, noOfDays, noOfNights}) => {
    if ((noOfDays && !noOfNights) || (noOfNights && !noOfDays)) {
        return "Number of days and number of nights must be provided together";
    } 

    if (noOfDays && noOfNights) {
        if (typeof noOfDays !== "number" || !Number.isInteger(noOfDays) || noOfDays <= 0 ||
            typeof noOfNights !== "number" || !Number.isInteger(noOfNights) || noOfNights < 0) {
                return "Number of days must be positive integer and number of days must be positive integer or zero"
            }
    }

    if ((startDate && !endDate) || (endDate && !startDate)) {
        return "Start date and end date must be provided together"
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end - start;
        if ((diffMs) < 0) {
            return "End date must be later than start date"
        } 

        if (!noOfDays) {
            return "Number of days is required if start date and end date are both provided";
        } 

        const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1;
        if (noOfDays !== diffDays) { 
            return "Number of days does not match with trip start date and end date";
        }
    }

    return null;
}

module.exports = {
    validateTripDates
}