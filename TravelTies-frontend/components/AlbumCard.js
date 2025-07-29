import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const AlbumCard = ({ album, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={{ uri: album.coverPhoto }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title}>{album.name}</Text>
      <Text>{album.photoCount} photos</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 6,
  },
  image: {
    width: 100,
    height: 60,
  },
  info: {
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
});

export default AlbumCard;