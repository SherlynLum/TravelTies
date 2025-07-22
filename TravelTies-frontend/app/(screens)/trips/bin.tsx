import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useAuth } from '@/context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getBinTrips } from '@/apis/tripApi';
import { getDisplayUrl } from '@/apis/awsApi';
import { BinTrip } from '@/types/trips';
import Loading from '@/components/Loading';
import { useFocusEffect } from 'expo-router';
import BinTripCard from '@/components/binTripCard';
import SearchBinTripModal from '@/components/SearchBinTripModal';

const Bin = () => {
  const {user, getUserIdToken} = useAuth();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<BinTrip[]>([]);
  const [hasError, setHasError] = useState(false);
  const insets = useSafeAreaInsets();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const getProfilePicUrl = async (token: string, key: string) => {
    try {
      const url = await getDisplayUrl(token, key);
        return url;
      } catch (e) {
        console.log(e);
        return "Failed to load";
    }
  }
  
  /* for testing:
  useEffect(() => {
    const tripsInBin = [{_id: "abc", name: "Japan trip", noOfParticipants: 1}, 
    {_id: "efg", name: "Korea trip", startDate: "2025-09-18", endDate: "2025-09-23", 
      noOfDays: 6, noOfNights: 5, noOfParticipants: 1},
    {_id: "hij", name: "Family trip", noOfDays: 3, noOfNights: 2, noOfParticipants: 1}];
    
    setTrips(tripsImBin)
  }, []);
  */

/**/ 

  // useFocusEffect ensure fetching every time screen gains focus including back navigation
  // useCallback prevents unnecessary re-run of the effect 
  useFocusEffect(
    useCallback(() => {
      const getTrips = async () => {
        try {
          setLoading(true);
          const token = await getUserIdToken(user);
          const binTrips = await getBinTrips(token);
          if (binTrips.length !== 0) { // if there is/are trip(s)
            const binTripsWithPicUrl = await Promise.all(
              binTrips.map(async (trip: BinTrip) => {
                if (trip.profilePicKey) { // if the trip has user set profile picture
                  const res = await getProfilePicUrl(token, trip.profilePicKey);
                  return {...trip, profilePicUrl: res}
                } else {
                  return trip;
                }
              })
            )
            setTrips(binTripsWithPicUrl)
          } else {
            setTrips([]);
          }
          setHasError(false);
        } catch (e) {
          console.log(e);
          setHasError(true);
        } finally {
          setLoading(false)
        }
      }
      getTrips();
    }, [])
  )
/**/

  const removeFromBin = (id: string) => {
    setTrips(prev => prev.filter(trip => trip._id !== id));
  }

  const closeSearchModal = () => {
    setSearchModalOpen(false);
  }

  return (
    <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
      <View className="flex flex-col px-5 pt-3 pb-3 gap-5">
        {/* search bar */}
        <TouchableOpacity onPress={() => setSearchModalOpen(true)}>
          <View className="flex flex-row items-center justify-start px-4 bg-gray-200 h-11
          rounded-5 gap-4">
            <FontAwesome name="search" size={15} color="#9CA3AF"/>
            <Text className="text-gray-400 font-medium text-base">
              Search by trip name
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* trips */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Loading size={hp(12)} />
        </View>
      ) : hasError ? (
        <View className="flex-1 justify-center items-center"> 
          <Text className="text-center text-base font-medium italic text-gray-500">
            {"An error occurred when loading your trips in bin.\nPlease try again later."}
          </Text>
        </View>
      ) :
        (<FlatList 
          data={trips} 
          renderItem={({item}) => (
            <BinTripCard trip={item} removeFromBin={removeFromBin} />
          )}
          keyExtractor={(item) => item._id.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center"> 
              <Text className="text-center text-base font-medium italic text-gray-500">
                {"You have no trips in bin"}
              </Text>
            </View>
          }
          contentContainerStyle={
            trips.length === 0 ? {flexGrow: 1, justifyContent: "center", alignItems: "center"} 
            : {flexGrow: 1, paddingVertical: 15}
          }
        />) 
      }
      <SearchBinTripModal isVisible={searchModalOpen} closeModal={closeSearchModal} 
        removeFromBin={removeFromBin} />
    </View>
  )
}

export default Bin