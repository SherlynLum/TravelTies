import { View, Text, Pressable, Alert, Image, Switch, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/authContext';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreference, getProfileWithUrl, updatePreference } from '@/apis/userApi';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { getTripsStats } from '@/apis/tripApi';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { handleDelete } from '@/utils/handleDelete';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Profile = () => {
  const {logout, user, getUserIdToken} = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [stats, setStats] = useState<{planning: number, ongoing: number, completed: number}>();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const router = useRouter();
  const themeData = [
        {label: "Light", value: "light"},
        {label: "Dark", value: "dark"},
        {label: "System", value: "system"}
    ]

  const getUiPreference = async (token: string) => {
    const preference = await getPreference(token);
    setNotificationEnabled(preference.notificationEnabled);
    setTheme(preference.theme);
  }

  // get current user's profile 
  useEffect(() => {
    setLoading(true);

    const getUserProfile = async () => {
      try {
        const token = await getUserIdToken(user);
        const profile = await getProfileWithUrl(token);
        setUsername(profile.username);
        if (profile.profilePicUrl) {
          setProfilePicUrl(profile.profilePicUrl);
        }
        await getUiPreference(token);
        const tripsStats = await getTripsStats(token);
        setStats(tripsStats);
      } catch (e) {
        console.log(e);
        Alert.alert("Profile", 
        "Unable to load profile details",
        [{
            text: "Back to trips dashboard",
            onPress: () => router.replace(`/tripsDashboard`)
        }])
      } finally {
        setLoading(false);
      }
    }
    getUserProfile();
  }, [])

  useEffect(() => {
    const updateUiPreference = async () => {
      try {
        const token = await getUserIdToken(user);
        await updatePreference({token, notificationEnabled, theme});
      } catch (e) {
        console.log(e);
        // try go back to the latest preference
        try {
          const token = await getUserIdToken(user);
          await getUiPreference(token);
          Alert.alert("Failed to update display settings", 
            "Notifications and theme have been reverted to your previously saved settings");
        } catch (e) {
          console.log(e)
          setNotificationEnabled(true);
          setTheme("system");
          Alert.alert("Failed to update display settings",
            "Notifications and theme have been reverted to the default settings");
        }
      }
    }
    updateUiPreference()
  }, [notificationEnabled, theme])

  const signOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.log(e);
      Alert.alert("Sign out", "Failed to sign out - please try again later");
    }
  }

  const handleSignOut = () => {
    handleDelete("Sign out", "Are you sure you want to sign out of your account?", signOut);
  }

  return (
    <>
    <StatusBar 
        translucent
        backgroundColor="transparent"
        style="dark"
    />
    {loading ? (
      <View className="flex-1 justify-center items-center">
        <Loading size={hp(12)} />
      </View>
    ) : (
    <>
    <View className="flex flex-col items-center justify-center w-full px-6 pb-5 gap-5" 
    style={{paddingTop: insets.top, backgroundColor: "#6495ED"}}>
      <View className="flex flex-row justify-between items-center px-1 pt-5">
        <View className="flex flex-row items-center justify-start gap-4">
          {/* profile picture */}
          <Image source={!profilePicUrl 
            ? require("../../../assets/images/default-user-profile-pic.png") 
            : profilePicUrl === "Failed to load" 
            ? require("../../../assets/images/error-icon.png")
            : {uri: profilePicUrl}}
            className="border-white border-4 w-[80px] h-[80px] rounded-[40px]" />
          {/* username */}
          <Text className="font-bold text-white text-2xl">
            {username}
          </Text>
        </View>
        {/* edit profile button */}
        <Pressable onPress={() => router.push("/settings/editProfile")} hitSlop={14}>
          <FontAwesome6 name="edit" size={24} color="white" />
        </Pressable>
      </View>

      {/* trips stats */}
      <View className="flex flex-row bg-white px-3 py-3 gap-3 items-center justify-center rounded-xl">
        <View className="flex flex-col items-center justify-center gap-1">
          <Text className="font-semibold text-black text-base text-center">
            Planning
          </Text>
          <Text className="font-semibold text-black text-base text-center">
            {stats?.planning || 0}
          </Text>
        </View>

        <View className="w-[2px] h-full bg-gray-300" />

        <View className="flex flex-col items-center justify-center gap-1">
          <Text className="font-semibold text-black text-base text-center">
            Ongoing
          </Text>
          <Text className="font-semibold text-black text-base text-center">
            {stats?.ongoing || 0}
          </Text>
        </View>

        <View className="w-[2px] h-full bg-gray-300" />

        <View className="flex flex-col items-center justify-center gap-1">
          <Text className="font-semibold text-black text-base text-center">
            Completed
          </Text>
          <Text className="font-semibold text-black text-base text-center">
            {stats?.completed || 0}
          </Text>
        </View>
      </View>
    </View>

    <ScrollView className="flex-1 py-5">
      <View className="items-center justify-center gap-[1px]">
        {/* friends */}
        <Pressable onPress={() => router.push("/settings/friends")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full rounded-tl-xl 
        rounded-tr-xl">
          <View className="flex flex-row gap-4 items-center justify-center">
            <FontAwesome5 name="user-friends" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Friends
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* join trip */}
        <Pressable onPress={() => router.push("/settings/joinTrip")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <Ionicons name="add-circle-outline" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Join a trip
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* reset password */}
        <Pressable onPress={() => router.push("/settings/resetPassword")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <MaterialCommunityIcons name="lock-reset" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Reset password
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* notifications */}
        <View 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <MaterialCommunityIcons name="bell" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Notifications
            </Text>
          </View>
          <Switch value={notificationEnabled} onValueChange={() => setNotificationEnabled(prev => !prev)}/>
        </View>

        {/* theme */}
        <View 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <MaterialCommunityIcons name="theme-light-dark" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Theme
            </Text>
          </View>
          <Dropdown
          style={{height: 22, backgroundColor: "white", paddingHorizontal: 16, borderRadius: 2,
          borderColor: "black", borderWidth: 1}}
          data={themeData}
          labelField="label"
          valueField="value"
          placeholder="Select theme"
          placeholderStyle={{color: "gray"}}
          selectedTextStyle={{fontWeight: "600", color: "black", fontSize: 16}}
          inputSearchStyle={{fontWeight: "600", color: "black", fontSize: 16}}
          value={theme}
          onChange={item => setTheme(item.value)}
          />
        </View>

        {/* tutorial & support */}
        <Pressable onPress={() => router.push("/settings/support")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <MaterialCommunityIcons name="help-rhombus-outline" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Tutorial & Support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* view privacy policy */}
        <Pressable onPress={() => router.push("/settings/privacyPolicy")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <MaterialCommunityIcons name="file-document-outline" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              View privacy policy
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* rate us */}
        <Pressable onPress={() => router.push("/settings/rateUs")} 
        className="bg-white px-5 py-4 flex flex-row justify-between items-center w-full">
          <View className="flex flex-row gap-4 items-center justify-center">
            <Ionicons name="star" size={22} color="black" />
            <Text className="font-semibold text-black text-base text-center">
              Rate us
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="gray" />
        </Pressable>

        {/* Sign out */}
        <Pressable onPress={handleSignOut} 
        className="bg-white px-5 py-4 w-full rounded-bl-xl rounded-br-xl">
          <Text className="font-semibold text-red-600 text-base text-center">
            Sign out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
    </>
    )}
    </>
  )
}

export default Profile