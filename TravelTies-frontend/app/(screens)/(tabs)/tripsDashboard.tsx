import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FlatList} from 'react-native-gesture-handler';
import { getActiveTrips } from '@/apis/tripApi';
import { getDisplayUrl } from '@/apis/awsApi';
import { Trip } from '@/types/trips';
import ActiveTripCard from '@/components/activeTripCard';
import Loading from '@/components/Loading';
import { useRouter } from 'expo-router';
import SearchActiveTripModal from '@/components/SearchActiveTripModal';

const TripsDashboard = () => {
  const {user, getUserIdToken} = useAuth();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
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
    const activeTrips = [{_id: "abc", name: "Japan trip", noOfParticipants: 1}, 
    {_id: "efg", name: "Korea trip", startDate: "2025-09-18", endDate: "2025-09-23", 
      noOfDays: 6, noOfNights: 5, noOfParticipants: 1},
    {_id: "hij", name: "Family trip", noOfDays: 3, noOfNights: 2, noOfParticipants: 1}];
    
    setTrips(activeTrips)
  }, []);
  */

/**/ 
  useEffect(() => {
    const getTrips = async () => {
      try {
        setLoading(true);
        const token = await getUserIdToken(user);
        const activeTrips = await getActiveTrips(token);
        if (activeTrips.length !== 0) { // if there is/are trip(s)
          const activeTripsWithPicUrl = await Promise.all(
            activeTrips.map(async (trip: Trip) => {
              if (trip.profilePicKey) { // if the trip has user set profile picture
                const res = await getProfilePicUrl(token, trip.profilePicKey);
                return {...trip, profilePicUrl: res}
              } else {
                return trip;
              }
            })
          )
          setTrips(activeTripsWithPicUrl)
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
/**/

  const closeSearchModal = () => {
    setSearchModalOpen(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-col px-5 pt-1 pb-2 gap-5">
        <View className="flex flex-row justify-between items-center">
          {/* title */}
          <Text className="font-semibold text-3xl tracking-wide">
            Your Trips
          </Text>

          <View className="flex flex-row gap-7 justify-center items-center">
            {/* add trip button */}
            <TouchableOpacity onPress={() => router.push("/trips/addTrip")} hitSlop={10}>
              <Ionicons name="add-circle" size={30} color="#3B82F6" />
            </TouchableOpacity>

            {/* open trips bin button */}
            <TouchableOpacity onPress={() => router.push("/trips/bin")} hitSlop={10}>
              <Feather name="trash-2" size={25} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

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
            {"An error occurred when loading your trips.\nPlease try again later."}
          </Text>
        </View>
      ) :
        (<FlatList 
          data={trips} 
          renderItem={({item}) => (
            <ActiveTripCard {...item} />
          )}
          keyExtractor={(item) => item._id.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center"> 
              <Text className="text-center text-base font-medium italic text-gray-500">
                {"You have no active trips.\nTap the \"+\" on the top right to add a trip."}
              </Text>
            </View>
          }
          contentContainerStyle={
            trips.length === 0 ? {flexGrow: 1, justifyContent: "center", alignItems: "center"} 
            : {flexGrow: 1, paddingVertical: 15}
          }
        />) 
      }
      <SearchActiveTripModal isVisible={searchModalOpen} closeModal={closeSearchModal} />
    </SafeAreaView>
  )
}

export default TripsDashboard
