const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/gallery.controller");
const upload = require("../middlewares/upload.middleware");

// Photos
router.get("/photos/:tripId", galleryController.getAllPhotos);
router.delete("/photos", galleryController.deletePhotos);
router.patch("/photos/move", galleryController.movePhotosToAlbum);

router.post("/debug/:tripId", upload.array("photos", 10), galleryController.debugUpload);

// Albums
router.get("/albums/:tripId", galleryController.getAllAlbums);
router.post("/albums/:tripId", galleryController.createAlbum);
router.get("/albums/:albumId/photos", galleryController.getAlbumPhotos);
router.delete("/albums/:albumId", galleryController.deleteAlbum);
router.patch("/albums/:albumId/photos", galleryController.removePhotosFromAlbum);
router.post(
    "/photos/:tripId",
    upload.array("photos", 10), // allow up to 10 photos at once
    galleryController.uploadPhotos
);

module.exports = router;