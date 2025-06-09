import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loading from '../components/Loading.js';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default function StartPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center">
        <Loading size={hp(8)} />
      </View>
    </SafeAreaView>
  );
}



