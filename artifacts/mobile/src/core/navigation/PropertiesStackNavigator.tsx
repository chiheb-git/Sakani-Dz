import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PropertiesScreen from "../../features/properties/PropertiesScreen";
import PropertyDetailScreen from "../../features/properties/PropertyDetailScreen";

export type PropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyDetail: { propertyId: number };
};

const Stack = createNativeStackNavigator<PropertiesStackParamList>();

export default function PropertiesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="PropertiesList" component={PropertiesScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}