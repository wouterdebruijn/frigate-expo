import * as React from "react";
import { View, Text, Settings, FlatList } from "react-native";
import Player from "../components/Player";
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen({ navigation }: any) {
  async function getSettings() {
    try {
      const jsonValue = await AsyncStorage.getItem('settings')
      return jsonValue != null ? JSON.parse(jsonValue) : undefined;
    } catch (e) {
      // error reading value
    }
  }

  const [host, setHost] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<any[]>([]);

  function onVideoClick(uri: string) {
    navigation.navigate("VideoDetail", { uri });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      ScreenOrientation.unlockAsync();

      getSettings().then(settings => {
        if (settings) {
          setHost(settings.host);
          setCameras(settings.cameras.filter((camera: any) => camera.enabled));
        }
      });

    });

    return unsubscribe;
  });

  function CameraView() {
    return (
      <View style={{ flex: 1, gap: 5 }}>
        <FlatList
          data={cameras}
          renderItem={({ item }) => <Player uri={`${host}/live/webrtc/api/stream.mp4?src=${item.stream}&video=h264`} onClick={onVideoClick} />}
        />
      </View>
    )
  }

  return (
    host !== "" || cameras.length === 0 ?

      <View style={{ flex: 1, padding: 16, gap: 5 }}>
        <CameraView />
      </View>

      : <View><Text>No Host set</Text></View>
  );
}