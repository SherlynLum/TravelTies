const Photo = require("../models/photo.model.js");

const uploadPhotosForItinerary = async ({uid, tripId, keys}) => {
    const photoObjects = keys.map(key => ({tripId, uploadedByUid: uid, key}));
    const newPhotos = await Photo.insertMany(photoObjects);
    const picIds = newPhotos.map(photo => photo._id);
    return picIds;
}

module.exports = {
    uploadPhotosForItinerary
};