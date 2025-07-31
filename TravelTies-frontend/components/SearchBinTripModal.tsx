import { View, Text, Modal, Pressable, TextInput, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Trip } from '@/types/trips';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/authContext';
import Loading from './Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { searchInBin } from '@/apis/tripApi';
import CustomKeyboardView from './CustomKeyboardView';
import BinTripCard from './binTripCard';

type SearchBinTripProps = {
    isVisible: boolean,
    closeModal: () => void,
    removeFromBin: (id: string) => void
}

const SearchBinTripModal = ({isVisible, closeModal, removeFromBin} : SearchBinTripProps) => {
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
                    const results = await searchInBin(token, cleanedSearchTerm);
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
        <SafeAreaView className="flex-1 bg-white">
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
                            {"Type in the search bar above to find trips in bin"}
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
                        <BinTripCard trip={item} removeFromBin={removeFromBin}/>
                    )}
                    keyExtractor={(item) => item._id.toString()}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center"> 
                            <Text className="text-center text-base font-medium italic text-gray-500">
                                {"No trip in bin matches this search term"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={
                        trips.length === 0 ? {flexGrow: 1, justifyContent: "center", alignItems: "center"} 
                        : {flexGrow: 1, paddingVertical: 15}
                    }/>
                )}
            </CustomKeyboardView>
        </SafeAreaView>
    </Modal>
  )
}

export default SearchBinTripModal