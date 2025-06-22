const validateTripDates = ({startDate, endDate, noOfDays, noOfNights}) => {
    if ((noOfDays && !noOfNights) || (noOfNights && !noOfDays)) {
        return "Number of days and number of nights must be provided together";
    } 

    if (noOfDays && noOfNights) {
        if (typeof noOfDays !== "number" || !Number.isInteger(noOfDays) || noOfDays <= 0 ||
            typeof noOfNights !== "number" || !Number.isInteger(noOfNights) || noOfNights <= 0) {
                return "Number of days and number of nights must be positive integers"
            }
    }

    if (startDate && noOfDays && !endDate) {
        return "End date is required if start date and number of days are both provided";
    }

    if (endDate && noOfDays && !startDate) {
        return "Start date is required if end date and number of days are both provided";
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
        if (noOfDays !== diffDays) { // convert to Number just in case noOfDays is a string
            return "Number of days does not match with trip start date and end date";
        }
    }

    return null;
}

module.exports = {
    validateTripDates
}