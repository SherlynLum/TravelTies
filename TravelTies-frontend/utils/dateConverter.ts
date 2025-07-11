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

export {
    toFloatingDate,
    toDisplayDate,
    toDisplayDay,
    toLocalDateObj
}