const {createTask, createItem, getItems, getItem, editItem, editTask} = require("../services/checklist.service.js");

const createTaskController = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId, isGroupItem, task, note, date, time, notificationId} = req.body;
    if (time && !date) {
        return res.status(400).json({message: "Date must be set before time can be set"});
    } 
    if (date && !notificationId) {
        return res.status(400).json({message: "Notification must be scheduled if date is set"});
    }
    if (!uid || !tripId || !task) {
        return res.status(400).json({message: "Missing required fields"});
    }

    try {
        const newTask = await createTask({uid, tripId, isGroupItem, task, note, date, time, notificationId});
        return res.status(201).json({task: newTask});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const createItemController = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId, isGroupItem, item, note} = req.body;
    if (!uid || !tripId || !item) {
        return res.status(400).json({message: "Missing required field(s)"});
    }

    try {
        const newItem = await createItem({uid, tripId, isGroupItem, item, note});
        return res.status(201).json({item: newItem});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getUncheckedTasks = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId} = req.params;
    if (!uid || !tripId) {
        return res.status(400).json({message: "Missing required field(s)"});
    }

    try {
        const tasks = await getItems({uid, tripId, type: "task", isCompleted: false});
        return res.status(200).json({tasks});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getUncheckedItems= async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId} = req.params;
    if (!uid || !tripId) {
        return res.status(400).json({message: "Missing required field(s)"});
    }

    try {
        const items = await getItems({uid, tripId, type: "packing", isCompleted: false});
        return res.status(200).json({items});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getCheckedTasks = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId} = req.params;
    if (!uid || !tripId) {
        return res.status(400).json({message: "Missing required field(s)"});
    }

    try {
        const tasks = await getItems({uid, tripId, type: "task", isCompleted: true});
        return res.status(200).json({tasks});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getCheckedItems= async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {tripId} = req.params;
    if (!uid || !tripId) {
        return res.status(400).json({message: "Missing required field(s)"});
    }

    try {
        const items = await getItems({uid, tripId, type: "packing", isCompleted: true});
        return res.status(200).json({items});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getItemById = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "Missing item id"});
    }

    try {
        const item = await getItem(id);
        if (!item) {
            return res.status(404).json({message: "No item is found"});
        }
        return res.status(200).json({item});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const editTaskController = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {itemId, isGroupItem, task, note, date, time, notificationId} = req.body;
    if (time && !date) {
        return res.status(400).json({message: "Date must be set before time can be set"});
    } 
    if (date && !notificationId) {
        return res.status(400).json({message: "Notification must be scheduled if date is set"});
    }
    if (!uid || !itemId || !task) {
        return res.status(400).json({message: "Missing required fields"});
    }

    try {
        const updatedTask = await editTask({uid, itemId, isGroupItem, task, note, date, time, 
            notificationId}); 
        if (!updatedTask) {
            return res.status(404).json({message: "No item is found"});
        }
        return res.status(200).json({task: updatedTask});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const editItemController = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.body.uid;
    const {itemId, isGroupItem, item, note} = req.body;
    if (!uid || !itemId || !item) {
        return res.status(400).json({message: "Missing required fields"});
    }

    try {
        const updatedItem = await editItem({uid, itemId, isGroupItem, item, note});
        if (!updatedItem) {
            return res.status(404).json({message: "No item is found"});
        }
        return res.status(200).json({item: updatedItem});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    createTaskController,
    createItemController,
    getUncheckedTasks,
    getUncheckedItems,
    getCheckedTasks,
    getCheckedItems,
    getItemById,
    editTaskController,
    editItemController
}