import * as React from "react";
import { Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import VideoDetailScreen from "./screens/VideoDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: "Frigate",
              headerRight: () => (
                <Pressable
                  onPress={() => navigation.navigate("Settings")}
                  style={{ padding: 8 }}
                >
                  <MaterialIcons name="settings" size={24} color="#2C2C2E" />
                </Pressable>
              ),
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="VideoDetail"
            component={VideoDetailScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
