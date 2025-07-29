import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, Alert, TextInput, Modal, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import GalleryTabs from '@/components/GalleryTabs';
import PhotoGrid from '@/components/PhotoGrid';
import AlbumCard from '@/components/AlbumCard';
import FAB from '@/components/FAB';
import { getPhotos, getAlbums, uploadPhoto, createAlbum } from '@/apis/galleryApi';
import { useLocalSearchParams } from 'expo-router';

export default function GalleryScreen() {
  const { id: tripId } = useLocalSearchParams(); // ✅ moved inside the component

  const [activeTab, setActiveTab] = useState<'All' | 'Albums'>('All');
  const [photos, setPhotos] = useState([]);
  type Album = { _id: string; [key: string]: any };
  const [albums, setAlbums] = useState<Album[]>([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log('Trip ID:', tripId);
    fetchGalleryData();
  }, [tripId]);

  const fetchGalleryData = async () => {
    try {
      const photoData = await getPhotos(tripId);
      const albumData = await getAlbums(tripId);
      setPhotos(photoData || []);
      setAlbums(albumData || []);
    } catch (err) {
      console.error("Failed to fetch gallery data:", err);
    }
  };

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        for (let asset of result.assets) {
          console.log('Uploading:', asset.uri);
          await uploadPhoto(tripId, asset);
        }
        await fetchGalleryData();
      } catch (err) {
        console.error('Upload failed:', (err as any).response?.data || (err as any).message || err);
        Alert.alert("Upload failed", "Couldn't upload photos.");
      }
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('Album name required');
      return;
    }
    try {
      await createAlbum(tripId, newAlbumName);
      setModalVisible(false);
      setNewAlbumName('');
      await fetchGalleryData();
    } catch (err) {
      console.error("Create album failed:", err);
      Alert.alert("Album creation failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Gallery</Text>
      <GalleryTabs activeTab={activeTab} setTab={setActiveTab} />

      {activeTab === 'All' ? (
        <PhotoGrid photos={photos} />
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AlbumCard
              album={item}
              onPress={() => {
                // Add navigation or modal later
              }}
            />
          )}
          contentContainerStyle={styles.scrollContent}
        />
      )}

      <FAB onPress={() => {
        if (activeTab === 'All') {
          handleAddPhoto();
        } else {
          setModalVisible(true);
        }
      }} />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Album</Text>
            <TextInput
              placeholder="Album Name"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              style={styles.input}
            />
            <Button title="Create" onPress={handleCreateAlbum} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', paddingVertical: 16 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 12
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 5
  }
});