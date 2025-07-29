import axios from "axios";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL + "/api", // set this in .env
});

export const getPhotos = async (tripId) => {
  const res = await API.get(`/gallery/photos/${tripId}`);
  return res.data;
};

export const getAlbums = async (tripId) => {
  const res = await API.get(`/gallery/albums/${tripId}`);
  return res.data;
};

export const uploadPhoto = async (tripId, asset) => {
  const formData = new FormData();
  formData.append('photo', {
    uri: asset.uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  await axios.post(`/api/gallery/${tripId}/upload`, formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const createAlbum = async (tripId, name) => {
  return await axios.post(`/gallery/${tripId}/album`, { name });
};