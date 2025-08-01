import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getCardsInTab, getOrderInTab } from '@/apis/tripApi';
import Loading from '@/components/Loading';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { CardPreview } from '@/types/cards';
import NoteCard from '@/components/NoteCard';
import DestinationCard from '@/components/DestinationCard';
import TransportationCard from '@/components/TransportationCard';
import GeneralCard from '@/components/GeneralCard';
import { isAxiosError } from 'axios';

const Itinerary = () => {
  const insets = useSafeAreaInsets();
  const {user, getUserIdToken} = useAuth();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // for Typescript checking, although it is never possible to be an array 
  const [tabsLoading, setTabsLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [tab, setTab] = useState(""); 
  const [tabs, setTabs] = useState<string[]>([]);
  const [cards, setCards] = useState<CardPreview[]>([]);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const getTabs = async () => {
        try {
          setTabsLoading(true);
          const token = await getUserIdToken(user);
          const trip = await getOrderInTab({token, id});
          if (!trip) {
            throw new Error("No trip is found");
          }
          const tabs = Object.keys(trip.orderInTab);
          if (!tabs.includes("unscheduled")) {
            throw new Error("Could not find unscheduled tab"); // every itinerary must at least have the unscheduled tab
          }
          setTabs(tabs);
          setTab("unscheduled");
        } catch (e) {
          setTabs([]);
          setTab("");
          console.log(e);
          Alert.alert("Itinerary", "Unable to load this trip’s itinerary", [
            {
              text: "Back to trip overview",
              onPress: () => router.back()
            }
          ])
        } finally {
          setTabsLoading(false);
        }}
      getTabs();
    }, [])
  )

  useEffect(() => {
    if (!tab) {
      setCards([]);
      setHasError(false);
      return;
    }
    const getCards = async () => {
      try {
        setCardsLoading(true);
        const token = await getUserIdToken(user);
        const cardsInTab = await getCardsInTab({token, id, tab});
        setCards(cardsInTab);
        setHasError(false);
      } catch (e) {
        console.log(e);
        setCards([])
        setHasError(true);
      } finally {
        setCardsLoading(false);
      }
    }
    getCards();
  }, [tab]);

  const removeFromTab = (id: string) => {
    setCards(prev => prev.filter(card => card._id !== id));
  }

  return (
    <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
      {/* tabs */}
      {tabsLoading ? (
        <View className="flex-1 justify-center items-center">
          <Loading size={hp(12)} />
        </View>
      ) : (
        <View className="flex-1 flex-col py-4 w-full">
          <View className="flex">
            {/* tabs */}
            <FlatList
            data={tabs}
            renderItem={({item}) => (
              <TouchableOpacity
              onPress={() => setTab(item)} hitSlop={5}
              className={`bg-white justify-center items-center shadow-sm h-[35px] px-8 rounded-[30px]
              ${tab === item ? "border-blue-500 border-2" : "border-gray-500 border"}`}>
                <Text className={`font-semibold text-sm ${tab === item ? "text-blue-500" : "text-gray-500"}`}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View className="w-[12px]"/>
            )}
            contentContainerStyle={{paddingHorizontal: 20, height: 50}}
            />
          </View>
          {/* cards */}
          {cardsLoading ? (
            <View className="flex-1 justify-center items-center">
              <Loading size={hp(12)} />
            </View>
          ) : hasError ? (
            <View className="flex-1 justify-center items-center"> 
              <Text className="text-center text-base font-medium italic text-gray-500">
                {`An error occurred when loading itinerary cards for ${tab.charAt(0).toUpperCase() + tab.slice(1)}.\nPlease try again later.`}
              </Text>
            </View>
          ) : (
          <FlatList 
            data={cards} 
            renderItem={({item}) => {
              if (item.cardType === "note") {
                return (
                  <NoteCard tab={tab} tripId={id} _id={item._id} title={item.title} startDate={item.startDate}
                  startTime={item.startTime} endDate={item.endDate} endTime={item.endTime} 
                  description={item.description} removeFromTab={removeFromTab} />
                )
              } else if (item.cardType === "destination") {
                return (
                  <DestinationCard tab={tab} tripId={id} _id={item._id} title={item.title} startDate={item.startDate}
                  startTime={item.startTime} endDate={item.endDate} endTime={item.endTime} 
                  removeFromTab={removeFromTab} />
                )
              } else if (item.cardType === "transportation") {
                return (
                  <TransportationCard tab={tab} tripId={id} _id={item._id} title={item.title} startDate={item.startDate}
                  startTime={item.startTime} endDate={item.endDate} endTime={item.endTime} 
                  departureAddress={item.departureAddress} arrivalAddress={item.arrivalAddress}
                  removeFromTab={removeFromTab} />
                )
              } else {
                return (
                  <GeneralCard tab={tab} tripId={id} _id={item._id} cardType={item.cardType} 
                  title={item.title} startDate={item.startDate} startTime={item.startTime} 
                  endDate={item.endDate} endTime={item.endTime} generalAddress={item.generalAddress} 
                  removeFromTab={removeFromTab} />
                )
              }
            }}
            keyExtractor={(item) => item._id.toString()}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center"> 
                <Text className="text-center text-base font-medium italic text-gray-500">
                  {`You have no itinerary cards for ${tab.charAt(0).toUpperCase() + tab.slice(1)}.\nTap the \"+\" on the top right to add a card.`}
                </Text>
              </View>
            }
            contentContainerStyle={{flexGrow: 1, paddingVertical: 15}}
          />
          )} 
        </View>
      )}
    </View>
  )
}

export default Itinerary
