import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getActiveTrips } from '@/apis/tripApi';
import { Trip } from '@/types/trips';
import ActiveTripCard from '@/components/activeTripCard';
import Loading from '@/components/Loading';
import { useFocusEffect, useRouter } from 'expo-router';
import SearchActiveTripModal from '@/components/SearchActiveTripModal';

const TripsDashboard = () => {
  const {user, getUserIdToken} = useAuth();
  const [loading, setLoading] = useState(false);
  const [planningTrips, setPlanningTrips] = useState<Trip[]>([]);
  const [ongoingTrips, setOngoingTrips] = useState<Trip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [tab, setTab] = useState("Planning"); // default to planning when first render
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
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
  useFocusEffect(
    useCallback(() => {
      const getTrips = async () => {
        try {
          setLoading(true);
          const token = await getUserIdToken(user);
          const activeTrips = await getActiveTrips(token);
          setPlanningTrips(activeTrips.planning);
          setOngoingTrips(activeTrips.ongoing);
          setCompletedTrips(activeTrips.completed);
          setHasError(false);
        } catch (e) {
          console.log(e);
          setPlanningTrips([]);
          setOngoingTrips([]);
          setCompletedTrips([]);
          setHasError(true);
        } finally {
          setLoading(false)
        }
      }
      getTrips();
    }, []));
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
            <TouchableOpacity onPress={() => router.replace("/trips/addTrip")} hitSlop={10}>
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
      ) : (
        <View className="flex-1 flex-col px-5 py-4 w-full">
          <View className="flex flex-row justify-between items-center">
            {["Planning", "Ongoing", "Completed"].map(tabName => (
              <TouchableOpacity
              key={tabName} onPress={() => setTab(tabName)} hitSlop={5}
              className={`bg-white justify-center items-center shadow-sm h-[35px] px-8 rounded-[30px] 
              ${tab === tabName ? "border-blue-500 border-2": "border-gray-500 border"}`}>
                <Text className={`font-semibold ${tab === tabName ? "text-blue-500" : "text-gray-500"}
                text-sm`}>
                  {tabName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        <FlatList 
          data={tab === "Planning" ? planningTrips : tab === "Ongoing" ? ongoingTrips : completedTrips} 
          renderItem={({item}) => (
            <ActiveTripCard {...item} />
          )}
          keyExtractor={(item) => item._id.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center"> 
              <Text className="text-center text-base font-medium italic text-gray-500">
                {`You have no active trips under ${tab} category.\nTap the \"+\" on the top right to add a trip.`}
              </Text>
            </View>
          }
          contentContainerStyle={{flexGrow: 1, paddingVertical: 15}}
        />
        </View>
        ) 
      }
      <SearchActiveTripModal isVisible={searchModalOpen} closeModal={closeSearchModal} />
    </SafeAreaView>
  )
}

export default TripsDashboard
