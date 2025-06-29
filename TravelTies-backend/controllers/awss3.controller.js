const {deleteObject, generateDisplayUrl} = require("../services/awss3.service.js");


const getDisplayUrl = async (req, res) => {
    const {key} = req.query;

    if (!key) {
        return res.status(400).json({message: "Missing key to be found"});
    }

    try {
        const url = await generateDisplayUrl(key);
        return res.status(200).json({url});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

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
    deleteObjectFromAWS,
    getDisplayUrl
};