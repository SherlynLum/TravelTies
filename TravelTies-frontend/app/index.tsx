import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center">
        <ActivityIndicator size="large" color="grey" />
      </View>
    </SafeAreaView>
  );
}



