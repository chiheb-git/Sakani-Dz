import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { store } from "./src/core/store";
import RootNavigator from "./src/core/navigation/RootNavigator";
import AuthBootstrap from "./src/core/AuthBootstrap";
import { LANGUAGE_SETUP_KEY, i18n, initializeI18n, setStoredLanguage, type SupportedLanguage } from "./src/core/i18n";
import LanguageSelectionScreen from "./src/features/profile/LanguageSelectionScreen";
import AnimatedBackground from "./src/shared/components/AnimatedBackground";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const hasSetup = await AsyncStorage.getItem(LANGUAGE_SETUP_KEY);
      await initializeI18n();
      if (!hasSetup) {
        setShowLanguageSelection(true);
      }
      setBooted(true);
    };

    bootstrap().catch(() => setBooted(true));
  }, []);

  if (!booted) {
    return (
      <AnimatedBackground>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: 1 }}>SAKANI DZ</Text>
          <Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 8, fontSize: 14 }}>Votre adresse, autrement</Text>
          <ActivityIndicator size="small" color="#E0C687" style={{ marginTop: 28 }} />
        </View>
      </AnimatedBackground>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {showLanguageSelection ? (
        <LanguageSelectionScreen
          onSelect={async (language: SupportedLanguage) => {
            await AsyncStorage.setItem(LANGUAGE_SETUP_KEY, "true");
            await setStoredLanguage(language);
            await i18n.changeLanguage(language);
            setShowLanguageSelection(false);
            setBooted(true);
          }}
        />
      ) : (
        <Provider store={store}>
          <AuthBootstrap>
            <StatusBar style="light" />
            <RootNavigator />
          </AuthBootstrap>
        </Provider>
      )}
    </I18nextProvider>
  );
}