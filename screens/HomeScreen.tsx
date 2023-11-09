import * as React from "react";
import { View, Text, Settings, FlatList } from "react-native";
import Player from "../components/Player";
import * as ScreenOrientation from 'expo-screen-orientation';
import { SettingController } from "../controllers/SettingsController";


export default function HomeScreen({ navigation }: any) {
  const [host, setHost] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<any[]>([]);
  const settingsController = new SettingController();

  function onVideoClick(uri: string) {
    navigation.navigate("VideoDetail", { uri });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      ScreenOrientation.unlockAsync();

      settingsController.getHost().then((host) => {
        setHost(host);
      });
      settingsController.getCameras().then((cameras) => {
        setCameras(cameras);
      });
    });
  }, []);

  function CameraView() {
    return (
      <FlatList
        data={cameras.filter((c: any) => c.enabled)}
        renderItem={({ item }) => <Player uri={item.stream} onClick={onVideoClick} />}
        keyExtractor={item => item.name}
      />
    )
  }

  return (
    host !== "" || cameras.length === 0 ?

      <View style={{margin: 5}}>
        <CameraView />
      </View>

      : <View><Text>No Host set</Text></View>
  );
}