import axios from "axios";
import {toLocalDateObjWithTime, toLocalDateObj} from "../utils/dateTimeConverter";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const getHeaders = (token) => {
    const header = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    return header;
}

const getUncheckedTasks = async ({token, tripId}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/checklist/${encodeURIComponent(tripId)}/tasks/unchecked`,
        {headers: getHeaders(token)}
    );
    const tasks = backendRes.data.tasks;
    const now = new Date();
    const tasksWithDdlCheck = tasks.map(task => {
        let dateObj, hasPassedDdl;
        if (task.date && task.time) {
            dateObj = toLocalDateObjWithTime(task.date, task.time);
        } else if (task.date && !task.time) {
            dateObj = toLocalDateObj(task.date);
        }
        if (dateObj instanceof Date) {
            hasPassedDdl = dateObj < now;
        } else {
            hasPassedDdl = false;
        }
        return {...task, hasPassedDdl};
    })
    return tasksWithDdlCheck;
}

const getUncheckedItems = async ({token, tripId}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/checklist/${encodeURIComponent(tripId)}/items/unchecked`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.items;
}

const getCheckedTasks = async ({token, tripId}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/checklist/${encodeURIComponent(tripId)}/tasks/checked`,
        {headers: getHeaders(token)}
    );
    const tasks = backendRes.data.tasks;
    const now = new Date();
    const tasksWithDdlCheck = tasks.map(task => {
        let dateObj, hasPassedDdl;
        if (task.date && task.time) {
            dateObj = toLocalDateObjWithTime(task.date, task.time);
        } else if (task.date && !task.time) {
            dateObj = toLocalDateObj(task.date);
        }
        if (dateObj instanceof Date) {
            hasPassedDdl = dateObj < now;
        } else {
            hasPassedDdl = false;
        }
        return {...task, hasPassedDdl};
    })
    return tasksWithDdlCheck;
}

const getCheckedItems = async ({token, tripId}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/checklist/${encodeURIComponent(tripId)}/items/checked`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.items;
}

const checkItem = async ({token, id}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/checklist/check/${encodeURIComponent(id)}`,
        {},
        {headers: getHeaders(token)}
    );
    return backendRes.data.item;
}

const uncheckItem = async ({token, id}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/checklist/uncheck/${encodeURIComponent(id)}`,
        {},
        {headers: getHeaders(token)}
    );
    return backendRes.data.item;
}

const deleteItem = async ({token, id}) => {
    await axios.delete(
        `${baseUrl}/api/checklist/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
}

export {
    getUncheckedTasks,
    getUncheckedItems,
    getCheckedTasks,
    getCheckedItems,
    checkItem,
    uncheckItem,
    deleteItem
}