import * as React from "react";
import { View, StyleSheet } from "react-native";
import FullscreenPlayer from "../components/FullscreenPlayer";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoDetailScreen({ route, navigation }: any) {
  const { uri, streamType, mjpegFallback, snapshotUrl } = route.params;

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    });

    return unsubscribe;
  });

  return (
    <View style={styles.container}>
      <FullscreenPlayer
        uri={uri}
        streamType={streamType}
        mjpegFallback={mjpegFallback}
        snapshotUrl={snapshotUrl}
        onClick={() => {}}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
