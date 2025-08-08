const Item = require("../models/item.model.js");

const createTask = async ({uid, tripId, isGroupItem, task, note, date, time, notificationId}) => {
    const newTask = await Item.create({tripId, type: "task", isGroupItem, 
        creatorUid: isGroupItem ? undefined : uid, name: task, note, date, time, notificationId});
    return newTask;
}

const createItem = async ({uid, tripId, isGroupItem, item, note}) => {
    const newItem = await Item.create({tripId, type: "packing", isGroupItem, 
        creatorUid: isGroupItem ? undefined : uid, name: item, note});
    return newItem;
}

const getItems = async ({uid, tripId, type, isCompleted}) => {
    const items = await Item.find({
        tripId, type, isCompleted, 
        $or: [{isGroupItem: false, creatorUid: uid}, {isGroupItem: true}]});
    return items;
}

const getItem = async (id) => {
    const item = await Item.findById(id);
    return item;
}

const editTask = async ({uid, itemId, isGroupItem, task, note, date, time, notificationId}) => {
    const updatedTask = await Item.findByIdAndUpdate(itemId,
        {$set: {isGroupItem, creatorUid: isGroupItem ? undefined : uid, name: task, note, date, time, 
            notificationId}},
        {new: true, runValidators: true});
    return updatedTask;
}

const editItem = async ({uid, itemId, isGroupItem, item, note}) => {
    const updatedItem = await Item.findByIdAndUpdate(itemId,
        {$set: {isGroupItem, creatorUid: isGroupItem ? undefined : uid, name: item, note}},
        {new: true, runValidators: true});
    return updatedItem;
}           

module.exports = {
    createTask, 
    createItem,
    getItems,
    getItem,
    editTask,
    editItem
}