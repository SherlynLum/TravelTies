import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// Define available tabs as a tuple
const TABS = ['All', 'Albums'] as const;
type TabOption = typeof TABS[number];

type Props = {
  activeTab: TabOption;
  setTab: (tab: TabOption) => void;
};

export default function GalleryTabs({ activeTab, setTab }: Props) {
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => setTab(tab)}
          style={[
            styles.tabButton,
            activeTab === tab && styles.activeTab,
          ]}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#333',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
});