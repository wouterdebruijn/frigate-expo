import * as React from "react";
import { View } from "react-native";
import FullscreenPlayer from "../components/FullscreenPlayer";
import * as ScreenOrientation from 'expo-screen-orientation';


export default function VideoDetailScreen({ route, navigation }: any) {
  const { uri } = route.params;

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    });

    return unsubscribe;
  });


  return (
    <View style={{ flex: 1, padding: 32 }}>
      <FullscreenPlayer uri={uri} onClick={() => { }} />
    </View>
  );
}
