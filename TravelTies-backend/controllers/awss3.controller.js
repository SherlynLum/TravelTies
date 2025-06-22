const {deleteObject} = require("../services/awss3.service.js");

const deleteObjectFromAWS = async (req, res) => {
    const {key} = req.body;

    if (!key) {
        return res.status(400).json({message: "Missing key to be deleted"});
    }

    try {
        await deleteObject(key);
        return res.sendStatus(204);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    deleteObjectFromAWS
};