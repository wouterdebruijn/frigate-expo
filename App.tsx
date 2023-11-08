import * as React from "react";
import { Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import VideoDetailScreen from "./screens/VideoDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button title="Settings" onPress={() => navigation.navigate("Settings")} color={"#222"} />
            ),
          })
          } />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="VideoDetail"
          component={VideoDetailScreen}
          options={{
            headerShown: false,
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}