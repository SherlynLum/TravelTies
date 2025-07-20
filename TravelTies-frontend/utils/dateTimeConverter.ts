const toFloatingDate = (date: Date) => {
    const year = date.getFullYear();
    // getMonth returns zero-based month index
    // padStart to ensure at least two characters, if shorter, pads "0" to the left
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`;
}

const toDisplayDate = (date: Date) => {
    return date.toLocaleDateString();
}

const toDisplayDay = (date: Date) => {
    return date.toLocaleDateString(undefined, {weekday: "short"})
}

const toLocalDateObj= (date: string) => {
    const [year, month, day] = date.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

const toTimeStr = (time: Date) => {
    return time.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"});
}

const timeStrToDate = (time: string) => {
    const [hours, mins] = time.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, mins, 0, 0);
    return now;
}

export {
    toFloatingDate,
    toDisplayDate,
    toDisplayDay,
    toLocalDateObj,
    toTimeStr,
    timeStrToDate
}