import * as React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Player from "../components/Player";
import * as ScreenOrientation from "expo-screen-orientation";
import { SettingController } from "../controllers/SettingsController";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }: any) {
  const [host, setHost] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<any[]>([]);
  const [gridColumns, setGridColumns] = React.useState<number>(2);
  const settingsController = new SettingController();

  function onVideoClick(uri: string) {
    // Find the camera to pass streamType and mjpegFallback along
    const camera = cameras.find(
      (c: any) => c.stream === uri || c.mjpegStream === uri,
    );
    navigation.navigate("VideoDetail", {
      uri,
      streamType: camera?.streamType || "hls",
      mjpegFallback: camera?.mjpegStream,
      snapshotUrl: camera?.thumbnail,
    });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.unlockAsync();

      settingsController.getHost().then((host) => {
        setHost(host);
      });
      settingsController.getCameras().then((cameras) => {
        setCameras(cameras);
      });
      settingsController.getGridColumns().then((columns) => {
        setGridColumns(columns);
      });
    });
  }, []);

  const enabledCameras = cameras.filter((c: any) => c.enabled);

  function CameraView() {
    return (
      <FlatList
        data={enabledCameras}
        renderItem={({ item }) => (
          <View style={gridColumns > 1 ? styles.gridItem : null}>
            <Player
              uri={item.stream}
              streamType={item.streamType}
              mjpegFallback={item.mjpegStream}
              snapshotUrl={item.thumbnail}
              onClick={onVideoClick}
            />
          </View>
        )}
        keyExtractor={(item) => item.name}
        numColumns={gridColumns}
        key={`grid-${gridColumns}`}
        contentContainerStyle={styles.cameraList}
      />
    );
  }

  function WelcomeScreen() {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <MaterialIcons name="videocam" size={72} color="#2C2C2E" />
          <Text style={styles.welcomeTitle}>Welcome to Frigate</Text>
          <Text style={styles.welcomeSubtitle}>
            Your mobile companion for Frigate NVR
          </Text>
          <View style={styles.welcomeDivider} />
          <Text style={styles.welcomeText}>
            To get started, you'll need to connect to your Frigate server.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#2C2C2E" />
              <Text style={styles.featureText}>Live camera streams</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#2C2C2E" />
              <Text style={styles.featureText}>Multiple stream types</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#2C2C2E" />
              <Text style={styles.featureText}>Optimized bandwidth usage</Text>
            </View>
          </View>
          <Pressable
            style={styles.welcomeButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <MaterialIcons name="settings" size={20} color="#fff" />
            <Text style={styles.welcomeButtonText}>Configure Server</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function EmptyState() {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <MaterialIcons name="videocam-off" size={64} color="#d1d1d6" />
          <Text style={styles.emptyTitle}>No Cameras Enabled</Text>
          <Text style={styles.emptyText}>
            Enable cameras in Settings to start viewing your feeds.
          </Text>
          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <MaterialIcons name="settings" size={20} color="#fff" />
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return enabledCameras.length > 0 ? (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <CameraView />
    </SafeAreaView>
  ) : !host ? (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <WelcomeScreen />
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <EmptyState />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  cameraList: {
    padding: 8,
    paddingBottom: 24,
  },
  gridItem: {
    flex: 1,
    margin: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  settingsButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginTop: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 20,
  },
  welcomeDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#f2f2f7",
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 15,
    color: "#3c3c43",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  featureList: {
    width: "100%",
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 15,
    color: "#3c3c43",
    marginLeft: 12,
    flex: 1,
  },
  welcomeButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
