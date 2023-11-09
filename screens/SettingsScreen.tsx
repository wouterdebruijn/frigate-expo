import * as React from "react";
import { StyleSheet, View, Text, Button, TextInput, ActivityIndicator, Image, FlatList, Alert } from "react-native";
import { SettingController, Camera } from "../controllers/SettingsController";
import { MaterialIcons } from '@expo/vector-icons';
import { FrigateController } from "../controllers/FrigateController";
import CameraList from "../components/CameraList";


export default function SettingsScreen({ navigation }: { navigation: any }) {
  const settingController = new SettingController();

  const [host, setHost] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<Camera[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  async function refreshButton() {
    setIsLoading(true);

    const frigateController = new FrigateController(host);

    const cameras = await frigateController.getCameras();

    await settingController.setHost(host);
    setCameras(cameras);

    setIsLoading(false);
  }

  React.useEffect(() => {
    settingController.getHost().then((host) => {
      setHost(host);
    });
    settingController.getCameras().then((cameras) => {
      setCameras(cameras);
    });

    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    settingController.setCameras(cameras);
  }, [cameras]);

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.hostLabel}>Host</Text>
        <TextInput
          style={styles.hostInput}
          onChangeText={text => setHost(text)}
          value={host}
          placeholder="https://"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
          onSubmitEditing={() => refreshButton()}
          keyboardType="url"
        />
        <MaterialIcons style={styles.hostRefreshIcon} name="refresh" size={24} color="gray" onPress={() => refreshButton()} />
      </View>
      <CameraList cameras={cameras} setCameras={setCameras} style={styles.container} />
      {isLoading ?? <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  hostLabel: {
  },
  hostInput: {
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  hostRefreshIcon: {
    position: "absolute",
    right: 0,
    bottom: 2,
  },
  loadingOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
    zIndex: 1,
  },
});
