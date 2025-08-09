const Item = require("../models/item.model.js");

const createTask = async ({uid, tripId, isGroupItem, task, note, date, time, notificationId}) => {
    const newTask = await Item.create({tripId, type: "task", isGroupItem, 
        creatorUid: uid, name: task, note, date, time, notificationId});
    return newTask;
}

const createItem = async ({uid, tripId, isGroupItem, item, note}) => {
    const newItem = await Item.create({tripId, type: "packing", isGroupItem, 
        creatorUid: uid, name: item, note});
    return newItem;
}

const getTasks = async ({uid, tripId, isCompleted}) => {
    const tasks = await Item.aggregate([
        {
            $match: {
                tripId,
                type: "task",
                isCompleted,
                $or: [{isGroupItem: false, creatorUid: uid}, {isGroupItem: true}]
            }
        },
        {
            $addFields: {
                hasDate: {$gt: [{$strLenCP: {$ifNull: ["$date", ""]}}, 0]},
                hasTime: {$gt: [{$strLenCP: {$ifNull: ["$time", ""]}}, 0]}
            }
        },
        {
            $sort: {
                hasDate: -1, date: 1, hasTime: -1, time: 1, createdAt: 1
            }
        }
    ])
    return tasks;
}

const getItems = async ({uid, tripId, isCompleted}) => {
    const items = await Item.find({
        tripId, type: "packing", isCompleted, 
        $or: [{isGroupItem: false, creatorUid: uid}, {isGroupItem: true}]})
        .sort({createdAt: 1});
    return items;
}

const getItem = async (id) => {
    const item = await Item.findById(id);
    return item;
}

const editTask = async ({uid, itemId, isGroupItem, task, note, date, time, notificationId}) => {
    const oldTask = await Item.findById(itemId);
    if (!oldTask) {
        throw new Error("No item is found");
    }
    if (oldTask.creatorUid !== uid) {
        throw new Error("Non-creator cannot modify the item");
    }
    const updatedTask = await Item.findByIdAndUpdate(itemId,
        {$set: {isGroupItem, name: task, note, date, time, notificationId}},
        {new: true, runValidators: true});
    return updatedTask;
}

const editItem = async ({uid, itemId, isGroupItem, item, note}) => {
    const oldItem = await Item.findById(itemId);
    if (!oldItem) {
        throw new Error("No item is found");
    }
    if (oldItem.creatorUid !== uid) {
        throw new Error("Non-creator cannot modify the item");
    }
    const updatedItem = await Item.findByIdAndUpdate(itemId,
        {$set: {isGroupItem, name: item, note}},
        {new: true, runValidators: true});
    return updatedItem;
}           

const checkItem = async (id) => {
    const checkedItem = await Item.findByIdAndUpdate(id, {$set: {isCompleted: true}},
        {new: true, runValidators: true});
    return checkedItem;
}

const uncheckItem = async (id) => {
    const uncheckedItem = await Item.findByIdAndUpdate(id, {$set: {isCompleted: false}},
        {new: true, runValidators: true});
    return uncheckedItem;
}

const deleteItem = async ({uid, id}) => {
    const item = await Item.findById(id);
    if (!item) {
        throw new Error("No item is found");
    }
    if (item.creatorUid !== uid) {
        throw new Error("Non-creator cannot delete the item");
    }
    await Item.findByIdAndDelete(id);
}

module.exports = {
    createTask, 
    createItem,
    getTasks,
    getItems,
    getItem,
    editTask,
    editItem,
    checkItem,
    uncheckItem,
    deleteItem
}