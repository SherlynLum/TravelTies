import { View, Text, TouchableOpacity, Dimensions, FlatList, Alert, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Item } from '@/types/item';
import { useAuth } from '@/context/authContext';
import { checkItem, getUncheckedItems, getUncheckedTasks } from '@/apis/checklistApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CheckBox from '@react-native-community/checkbox';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Divider } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';

const Checklists = () => {
  const insets = useSafeAreaInsets();
  const {user, getUserIdToken} = useAuth();
  const {id, tab: currentTab} = useLocalSearchParams();
  const [currentUid, setCurrentUid] = useState("");
  const screenWidth = Dimensions.get("window").width;
  const tabWidth = (screenWidth - 20 * 3) / 2 // padding 20 at each end and a gap of 20
  const [tab, setTab] = useState(currentTab === "Packing" ? currentTab : "Tasks");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timeoutIds = useRef<{[id: string]: number}>({});
  const router = useRouter();
  const isActive = useRef(true);

  useEffect(() => {
    const getItems = async () => {
      setLoading(true);
      try {
        const uid = user.uid;
        if (!uid) {
          throw new Error("Failed to get current user's uid");
        }
        setCurrentUid(uid);
        const token = await getUserIdToken(user);
        if (tab === "Tasks") {
          const tasks = await getUncheckedTasks({token, tripId: id});
          setItems(tasks);
          setHasError(false);
        } else if (tab === "Packing") {
          const packingItems = await getUncheckedItems({token, tripId: id});
          setItems(packingItems);
          setHasError(false);
        }
      } catch (e) {
        console.log(e);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }
    getItems();
  }, [tab]);

  const toggleCheck = async (id: string) => {
    setItems(prev => prev.map(item => {
      if (item._id === id) {
        const newIsCompleted = !item.isCompleted;
        if (newIsCompleted) {
          timeoutIds.current[id] = setTimeout(async () => {
            try {
              const token = await getUserIdToken(user);
              await checkItem({token, id});
              if (isActive.current) {
                setItems(prev => prev.filter(item => item._id !== id));
              }
            } catch (e) {
              console.log(e);
              if (isActive.current) {
                Alert.alert("Check off item", `Failed to check off ${item.name}`);
                setItems(prev => prev.map(item => item._id === id ? {...item, isCompleted: false} : item));
              }
            } finally {
              delete timeoutIds.current[id];
            }
          }, 5000);
        } else if (timeoutIds.current[id]) {
          clearTimeout(timeoutIds.current[id]);
          delete timeoutIds.current[id];
        }
        return {...item, isCompleted: newIsCompleted};
      }
      return item;
    }))
  }

  const toDisplayDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  // flag isActive to true when screen mounts, flag isActive to false when screen unmounts
  useEffect(() => {
    isActive.current = true
    return () => {isActive.current = false};
  }, [])
  
  return (
    <>
    <StatusBar 
      translucent
      backgroundColor="transparent"
      style="light"
    />
    <View className="flex-1 flex-col gap-5 items-center justify-start pt-6 bg-white" 
    style={{paddingBottom: insets.bottom}}>
      {/* tabs */}
      <View className="flex flex-row gap-5 items-center justify-center px-5">
      {["Tasks", "Packing"].map(tabName => (
          <TouchableOpacity
          key={tabName} onPress={() => setTab(tabName)} hitSlop={5}
          style={{width: tabWidth}}
          className={`bg-white justify-center items-center shadow-sm h-[35px] px-8 rounded-[30px] 
          ${tab === tabName ? "border-blue-500 border-2": "border-gray-500 border"}`}>
              <Text className={`font-semibold ${tab === tabName ? "text-blue-500" : "text-gray-500"}
              text-sm`}>
                  {tabName}
              </Text>
          </TouchableOpacity>
      ))}
      </View>

      <View className="flex w-full items-center px-5">
        {/* add button */}
        <TouchableOpacity onPress={() => {
          if (tab === "Tasks") {
            router.replace(`/trips/${id}/checklistRelated/tasks/addTask`);
          } else {
            router.replace(`/trips/${id}/checklistRelated/packing/addItem`);
          }
        }}
        className='bg-blue-400 justify-center items-center border border-blue-700 shadow-sm h-[40px] 
        px-10 rounded-[30px]'>
            <Text className='text-white font-semibold tracking-wider text-sm'>
                Add
            </Text>
        </TouchableOpacity>
      </View>

      {/* items */}
      {loading ? (
        <View className="flex-1 justify-center items-center px-5">
          <Loading size={hp(12)} />
        </View>
      ) : hasError ? (
        <View className="flex-1 justify-center items-center px-5"> 
          <Text className="text-center text-base font-medium italic text-gray-500">
            {`An error occurred when loading ${tab === "Tasks" ? "tasks" : "items in packing list"}.\nPlease try again later.`}
          </Text>
        </View>
      ) : (
      <FlatList 
        data={items} 
        renderItem={({item}) => (
          <View className="flex flex-row justify-between items-center px-5">
            <View className="flex flex-row gap-5 items-center justify-start">
              {/* checkbox */}
              <CheckBox
              value={item.isCompleted}
              onValueChange={() => toggleCheck(item._id)}
              />

              <View className="flex flex-col gap-1 items-start justify-start">
                <View className="flex flex-row gap-1 items-start justify-center">
                  {/* group icon */}
                  {item.isGroupItem && (
                    <MaterialIcons name="groups" size={19} color="#F97316" />
                  )}

                  {/* title */}
                  <Text className="text-black font-semibold text-base">
                    {item.name}
                  </Text>
                </View>

                  {/* note */}
                  {item.note && (
                    <Text className="text-black font-medium text-xs italic">
                      {item.note}
                    </Text>
                  )}

                  {/* time */}
                  {((tab === "Tasks") && item.date) && (
                    <Text className="text-black font-medium text-xs">
                      {item.time ? `${toDisplayDate(item.date)} ${item.time}` : toDisplayDate(item.date)}
                    </Text>
                  )}
              </View>
            </View>

            {/* edit button */}
            {(item.creatorUid === currentUid) && (
              <Pressable onPress={() => {
                if (tab === "Tasks") {
                  router.replace(`/trips/${id}/checklistRelated/tasks/${item._id}`);
                } else {
                  router.replace(`/trips/${id}/checklistRelated/packing/${item._id}`);
                }
              }} className="pl-5" hitSlop={14}>
                <FontAwesome6 name="edit" size={24} color="#3B82F6" />
              </Pressable>
            )}
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center"> 
            <Text className="text-center text-base font-medium italic text-gray-500">
              {`You have no ${tab === "Tasks" ? "task" : "item in packing list"}.\nTap the \"Add\" button to add one.`}
            </Text>
          </View>
        }
        contentContainerStyle={{flexGrow: 1, paddingBottom: 15}}
        ItemSeparatorComponent={() => <Divider />}
      />
      )} 
    </View>
  </>
)
}

export default Checklists
