const s3 = require("../utils/s3");
const Photo = require("../models/photo.model");
const Album = require("../models/album.model");

exports.getAllPhotos = async (req, res) => {
  const { tripId } = req.params;
  try {
    const photos = await Photo.find({ tripId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch photos" });
  }
};

exports.uploadPhotos = async (req, res) => {
  const { tripId } = req.params;
  const { uploadedByUid } = req.body;
  const files = req.files; // comes from multer

  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  try {
    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        // Upload to S3
        const s3Response = await s3.upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `gallery/${tripId}/${Date.now()}_${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype
        }).promise();

        // Save metadata to MongoDB
        const photo = await Photo.create({
          tripId,
          uploadedByUid,
          key: s3Response.Key
        });

        return photo;
      })
    );

    res.status(201).json({ success: true, photos: uploadedPhotos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to upload photos" });
  }
};

exports.deletePhotos = async (req, res) => {
  const { photoIds, deleteFromAll } = req.body; // deleteFromAll = true means remove from gallery

  try {
    const photos = await Photo.find({ _id: { $in: photoIds } });

    if (deleteFromAll) {
      // Delete from S3
      await Promise.all(
        photos.map(photo =>
          s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: photo.key
          }).promise()
        )
      );

      await Photo.deleteMany({ _id: { $in: photoIds } });
    } else {
      // Remove only from albums
      await Photo.updateMany(
        { _id: { $in: photoIds } },
        { $pull: { albumId: req.body.albumId } }
      );
    }

    res.status(200).json({ success: true, message: "Photos deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete photos" });
  }
};

exports.movePhotosToAlbum = async (req, res) => {
  const { photoIds, albumId } = req.body;

  try {
    await Photo.updateMany(
      { _id: { $in: photoIds } },
      { $addToSet: { albumId } } // avoid duplicates
    );

    res.status(200).json({ success: true, message: "Photos moved to album" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to move photos" });
  }
};

exports.getAllAlbums = async (req, res) => {
  const { tripId } = req.params;
  try {
    const albums = await Album.find({ tripId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, albums });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch albums" });
  }
};

exports.createAlbum = async (req, res) => {
  const { tripId } = req.params;
  const { name, createdByUid } = req.body;
  
  try {
    const album = await Album.create({
      tripId,
      name,
      createdByUid
    });
    res.status(201).json({ success: true, album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create album" });
  }
};

exports.getAlbumPhotos = async (req, res) => {
  const { albumId } = req.params;
  
  try {
    const photos = await Photo.find({ albumId: albumId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch album photos" });
  }
};

exports.deleteAlbum = async (req, res) => {
  const { albumId } = req.params;
  
  try {
    // Remove album reference from all photos
    await Photo.updateMany(
      { albumId: albumId },
      { $pull: { albumId: albumId } }
    );
    
    // Delete the album
    await Album.findByIdAndDelete(albumId);
    
    res.status(200).json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete album" });
  }
};

exports.removePhotosFromAlbum = async (req, res) => {
  const { albumId } = req.params;
  const { photoIds } = req.body;
  
  try {
    await Photo.updateMany(
      { _id: { $in: photoIds } },
      { $pull: { albumId: albumId } }
    );
    
    res.status(200).json({ success: true, message: "Photos removed from album" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to remove photos from album" });
  }
};
