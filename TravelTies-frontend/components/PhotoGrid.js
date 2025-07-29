import React from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';

const PhotoGrid = ({ photos }) => (
  <FlatList
    data={photos}
    numColumns={3}
    renderItem={({ item }) => (
      <Image source={{ uri: item.displayUrl }} style={styles.image} />
    )}
    keyExtractor={(item) => item._id}
  />
);

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 120,
    margin: 2,
  },
});

export default PhotoGrid;