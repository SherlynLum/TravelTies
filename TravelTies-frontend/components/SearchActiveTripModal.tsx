import { View, Text, Modal, Pressable, TextInput, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Trip } from '@/types/trips';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/authContext';
import Loading from './Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { searchActiveTrips } from '@/apis/tripApi';
import CustomKeyboardView from './CustomKeyboardView';
import ActiveTripCard from './activeTripCard';

type SearchActiveTripProps = {
    isVisible: boolean,
    closeModal: () => void,
}

const SearchActiveTripModal = ({isVisible, closeModal} : SearchActiveTripProps) => {
    const insets = useSafeAreaInsets();
    const [searchTerm, setSearchTerm] = useState("");
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const {user, getUserIdToken} = useAuth();
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        const cleanedSearchTerm = searchTerm.trim();
        if (cleanedSearchTerm) {
            setLoading(true);
            const timeout = setTimeout(async () => {
                try{
                    const token = await getUserIdToken(user);
                    const results = await searchActiveTrips(token, cleanedSearchTerm);
                    setTrips(results);
                    setHasError(false);
                } catch (e) {
                    console.log(e);
                    setHasError(true);
                } finally {
                    setLoading(false);
                }
            }, 500);

            return () => clearTimeout(timeout);
        } else {
            setTrips([]);
            setHasError(false);
        }
    }, [searchTerm])

  return (
    <Modal visible={isVisible} animationType="slide">
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 bg-white" style={{paddingTop: insets.top, 
            paddingBottom: insets.bottom, paddingLeft: insets.left, 
            paddingRight: insets.right}}>
            <CustomKeyboardView>
                {/* search bar */}
                <View className="px-5 py-5 items-center justify-center">
                    <View className="flex flex-row justify-between items-center">
                        <Pressable onPress={closeModal} hitSlop={14}>
                            <Text className="font-semibold text-gray-500 text-base">
                                Cancel
                            </Text>
                        </Pressable>
                        <View className="flex flex-row items-center justify-start px-4 bg-gray-200 h-11
                        rounded-5 gap-4">
                            <FontAwesome name="search" size={15} color="#9CA3AF"/>
                            <TextInput
                                autoCapitalize="none"
                                value={searchTerm}
                                onChangeText={value => setSearchTerm(value)}
                                className='flex-1 font-medium text-black text-base'
                                placeholder='Search by trip name'
                                placeholderTextColor={'gray'}
                                clearButtonMode="while-editing"
                                autoFocus
                            />
                        </View>
                    </View>
                </View>

                {/* trips list */}
                {!searchTerm.trim() ? (
                    <View className="flex-1 justify-center items-center px-5"> 
                        <Text className="text-center text-base font-medium italic text-gray-500">
                            {"Type in the search bar above to find active trips"}
                        </Text>
                    </View>
                ) : loading ? (
                    <View className="flex-1 justify-center items-center px-5">
                        <Loading size={hp(12)} />
                    </View>
                ) : hasError ? (
                    <View className="flex-1 justify-center items-center px-5"> 
                        <Text className="text-center text-base font-medium italic text-gray-500">
                            {"An error occurred when loading the search results.\nPlease try again later."}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                    data={trips} 
                    renderItem={({item}) => (
                        <ActiveTripCard {...item} />
                    )}
                    keyExtractor={(item) => item._id.toString()}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center"> 
                            <Text className="text-center text-base font-medium italic text-gray-500">
                                {"No active trip matches this search term"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={
                        trips.length === 0 ? {flexGrow: 1, justifyContent: "center", alignItems: "center"} 
                        : {flexGrow: 1, paddingVertical: 15}
                    }/>
                )}
            </CustomKeyboardView>
        </View>
    </Modal>
  )
}

export default SearchActiveTripModal