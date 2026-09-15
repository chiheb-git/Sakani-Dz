import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SitesScreen from "../../features/sites/SitesScreen";
import SiteDetailScreen from "../../features/sites/SiteDetailScreen";
import PropertyDetailScreen from "../../features/properties/PropertyDetailScreen";

export type SitesStackParamList = {
  SitesList: undefined;
  SiteDetail: { siteId: number };
  PropertyDetail: { propertyId: number };
};

const Stack = createNativeStackNavigator<SitesStackParamList>();

export default function SitesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="SitesList" component={SitesScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}