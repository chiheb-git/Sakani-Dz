import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { store } from "./src/core/store";
import RootNavigator from "./src/core/navigation/RootNavigator";
import AuthBootstrap from "./src/core/AuthBootstrap";

export default function App() {
  return (
    <Provider store={store}>
      <AuthBootstrap>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthBootstrap>
    </Provider>
  );
}