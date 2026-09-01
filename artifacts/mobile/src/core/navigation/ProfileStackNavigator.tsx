import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../features/profile/ProfileScreen";
import VendorRegisterScreen from "../../features/vendor/VendorRegisterScreen";
import VendorLoginScreen from "../../features/vendor/VendorLoginScreen";
import VendorForgotPasswordScreen from "../../features/vendor/VendorForgotPasswordScreen";
import VendorDashboardScreen from "../../features/vendor/VendorDashboardScreen";
import VendorPropertyFormScreen from "../../features/vendor/VendorPropertyFormScreen";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  VendorRegister: undefined;
  VendorLogin: undefined;
  VendorForgotPassword: undefined;
  VendorDashboard: undefined;
  VendorPropertyForm: { propertyId?: number } | undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
      <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />
      <Stack.Screen name="VendorForgotPassword" component={VendorForgotPasswordScreen} />
      <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <Stack.Screen name="VendorPropertyForm" component={VendorPropertyFormScreen} />
    </Stack.Navigator>
  );
}