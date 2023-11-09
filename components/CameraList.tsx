import React from "react";
import { View, Text, FlatList, Image, Button, StyleSheet } from "react-native";
import { Camera } from "../controllers/SettingsController";

function CameraListItem({ camera, setState }: { camera: Camera, setState: (state: boolean) => void }) {
  const title = camera.enabled ? "Enabled" : "Disabled";
  const color = camera.enabled ? "green" : "darkgray";

  return (
    <View style={styles.listItem}>
      <Image style={styles.thumbnail} source={{ uri: camera.thumbnail }} alt={`${camera.name} thumbnail`} />
      <Text>{camera.name}</Text>
      <Button title={title} onPress={() => setState(!camera.enabled)} color={color} />
    </View>
  )
}

export default function CameraList({ cameras, setCameras, style }: { cameras: Camera[], setCameras: React.Dispatch<React.SetStateAction<Camera[]>>, style: any }) {
  function updateCameraState(camera: Camera, state: boolean) {
    const newCameras = cameras.map((c: Camera) => {
      if (c.name === camera.name) {
        c.enabled = state;
      }
      return c;
    });
    setCameras(newCameras);
  }

  return (
    <View style={style}>
      <FlatList
        data={cameras}
        renderItem={({ item }) => <CameraListItem camera={item} setState={(state) => updateCameraState(item, state)} />}
        keyExtractor={item => item.name}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  thumbnail: {
    height: 100,
    aspectRatio: 1,
  }
});
