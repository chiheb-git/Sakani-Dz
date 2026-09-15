import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { colors } from "../../shared/theme/theme";
import type { RootState } from "../store";
import PropertiesStackNavigator from "./PropertiesStackNavigator";
import SitesStackNavigator from "./SitesStackNavigator";
import TourismStackNavigator from "./TourismStackNavigator";
import HistoryScreen from "../../features/history-favorites/HistoryScreen";
import ProfileStackNavigator from "./ProfileStackNavigator";
import VendorDashboardScreen from "../../features/vendor/VendorDashboardScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function TabsNavigator() {
  const { t } = useTranslation();
  const authRole = useSelector((state: RootState) => state.auth.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "shift",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Properties: "home",
            Sites: "business",
            Tourism: "map",
            History: "time",
            MyProperties: "briefcase",
            Profile: "person",
          };
          return <TabIcon name={icons[route.name] ?? "ellipse"} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Properties" component={PropertiesStackNavigator} options={{ title: t("properties.title") }} />
      <Tab.Screen name="Sites" component={SitesStackNavigator} options={{ title: t("sites.title") }} />
      <Tab.Screen name="Tourism" component={TourismStackNavigator} options={{ title: t("tourism.title") }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t("history.title") }} />
      {authRole === "vendor" ? (
        <Tab.Screen name="MyProperties" component={VendorDashboardScreen} options={{ title: t("vendor.myProperties") }} />
      ) : null}
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: t("profile.title") }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="Tabs" component={TabsNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}