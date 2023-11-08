import * as React from "react";
import { StyleSheet, View, Text, Button, TextInput, ActivityIndicator, Image, FlatList } from "react-native";
import { SettingController, Camera } from "../controllers/SettingsController";
import { FrigateController } from "../controllers/FrigateController";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const settingController = new SettingController();

  const [host, setHost] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<Camera[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [unsavedChanges, setUnsavedChanges] = React.useState<boolean>(false);

  async function getCameras() {
    setIsLoading(true);
    const frigateController = new FrigateController(host);
    const newCameras = await frigateController.getCameras();

    let oldCameras = cameras.map((camera: Camera) => {
      return {
        ...camera,
        unavailable: true,
      }
    });

    oldCameras = oldCameras.filter((camera) =>
      !newCameras.some((newCamera) => newCamera.name === camera.name)
    )

    setCameras([...newCameras, ...oldCameras]);
    setUnsavedChanges(true);

    setIsLoading(false);
  }

  async function getSettings() {
    const settings = await settingController.getSettings();
    if (settings) {
      setHost(settings.host);
      setCameras(settings.cameras);
    }
  }

  async function saveSettings() {
    await settingController.saveSettings({
      host,
      cameras,
    });
    setUnsavedChanges(false);
  }

  useFocusEffect(
    React.useCallback(() => {
      getSettings();
    }, [])
  );

  function CameraMiniView({ camera }: { camera: Camera }) {
    function renderText() {
      if (camera.unavailable) {
        return "Unavailable";
      } else if (camera.enabled) {
        return "Enabled";
      } else {
        return "Disabled";
      }
    }

    function renderColor() {
      if (camera.unavailable) {
        return "#ccc";
      } else if (camera.enabled) {
        return "#0c0";
      } else {
        return "#c00";
      }
    }

    return (
      <View style={styles.cameraView}>
        <Image
          style={styles.previewImage}
          source={{ uri: `${host}/api/${camera.name}/latest.jpg` }}
        />
        <Text>{camera.name}</Text>
        <Button
          title={renderText()}
          color={renderColor()}
          onPress={() => {
            camera.enabled = !camera.enabled;
            setCameras([...cameras]);
            setUnsavedChanges(true);
          }}
        />
      </View>
    )
  }

  function CameraView() {
    return (
      <View>
        <FlatList
          data={cameras}
          renderItem={({ item }) => <CameraMiniView camera={item} />}
          keyExtractor={(item) => item.name}
        />
      </View>
    )
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!unsavedChanges) {
        return;
      }

      e.preventDefault();

      saveSettings().then(() => {
        console.log("Settings saved");
        navigation.dispatch(e.data.action);
      });

      return unsubscribe;
    });
  }, [navigation, unsavedChanges]);


  return (
    <View>
      <View style={styles.container}>
        <Text>Host:</Text>
        <TextInput
          style={styles.textInput}
          value={host}
          onChangeText={(text) => {
            setHost(text);
            setUnsavedChanges(true);
          }}
        />
        <MaterialIcons style={styles.refreshCameraIcon} name="refresh" size={24} color="black" onPress={() => getCameras()} />
      </View>
      <View style={styles.container}>
        <CameraView />
      </View>
      <ActivityIndicator style={styles.activityIndicator} animating={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff"
  },
  textInput: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  activityIndicator: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
  },
  refreshCameraIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  previewImage: {
    width: 100,
    aspectRatio: 1,
  },
  cameraView: {
    backgroundColor: "#fff",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }
});
