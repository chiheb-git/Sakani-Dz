import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TourismScreen from "../../features/tourism/TourismScreen";
import TouristSpotDetailScreen from "../../features/tourism/TouristSpotDetailScreen";

export type TourismStackParamList = {
  TourismList: undefined;
  TouristSpotDetail: { spotId: number };
};

const Stack = createNativeStackNavigator<TourismStackParamList>();

export default function TourismStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="TourismList" component={TourismScreen} />
      <Stack.Screen name="TouristSpotDetail" component={TouristSpotDetailScreen} />
    </Stack.Navigator>
  );
}