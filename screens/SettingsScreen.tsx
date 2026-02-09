import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingController, Camera } from "../controllers/SettingsController";
import { MaterialIcons } from "@expo/vector-icons";
import { FrigateController } from "../controllers/FrigateController";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const settingController = new SettingController();

  const [savedHost, setSavedHost] = React.useState<string>("");
  const [inputHost, setInputHost] = React.useState<string>("");
  const [inputUsername, setInputUsername] = React.useState<string>("");
  const [inputPassword, setInputPassword] = React.useState<string>("");
  const [savedUsername, setSavedUsername] = React.useState<string>("");
  const [savedPassword, setSavedPassword] = React.useState<string>("");
  const [cameras, setCameras] = React.useState<Camera[]>([]);
  const [savedCameras, setSavedCameras] = React.useState<Camera[]>([]);
  const [gridColumns, setGridColumns] = React.useState<number>(2);
  const [savedGridColumns, setSavedGridColumns] = React.useState<number>(2);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSavingCameras, setIsSavingCameras] = React.useState<boolean>(false);
  const [hasUnsavedHostChanges, setHasUnsavedHostChanges] =
    React.useState<boolean>(false);
  const [hasUnsavedCameraChanges, setHasUnsavedCameraChanges] =
    React.useState<boolean>(false);

  async function handleSave() {
    if (!inputHost.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const frigateController = new FrigateController(inputHost);

      // Save authentication if provided
      if (inputUsername && inputPassword) {
        await settingController.setAuth(inputUsername, inputPassword);
        const loginSuccess = await frigateController.login(
          inputUsername,
          inputPassword,
        );
        if (!loginSuccess) {
          console.error("Authentication failed");
        }
      } else {
        // Clear auth if fields are empty
        await settingController.clearAuth();
      }

      const fetchedCameras = await frigateController.getCameras();

      // Merge with existing enabled states
      const mergedCameras = fetchedCameras.map((camera) => {
        const existing = cameras.find((c) => c.name === camera.name);
        return existing ? { ...camera, enabled: existing.enabled } : camera;
      });

      await settingController.setHost(inputHost);
      await settingController.setCameras(mergedCameras);

      setSavedHost(inputHost);
      setSavedUsername(inputUsername);
      setSavedPassword(inputPassword);
      setCameras(mergedCameras);
      setSavedCameras(mergedCameras);
      setHasUnsavedHostChanges(false);
      setHasUnsavedCameraChanges(false);
    } catch (error) {
      console.error("Failed to connect to Frigate:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCameras() {
    setIsSavingCameras(true);
    try {
      await settingController.setCameras(cameras);
      await settingController.setGridColumns(gridColumns);
      setSavedCameras([...cameras]);
      setSavedGridColumns(gridColumns);
      setHasUnsavedCameraChanges(false);
    } catch (error) {
      console.error("Failed to save cameras:", error);
    } finally {
      setIsSavingCameras(false);
    }
  }

  function toggleCamera(camera: Camera) {
    const newCameras = cameras.map((c: Camera) =>
      c.name === camera.name ? { ...c, enabled: !c.enabled } : c,
    );
    setCameras(newCameras);
  }

  React.useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const host = await settingController.getHost();
        const auth = await settingController.getAuth();
        const savedCams = await settingController.getCameras();
        const columns = await settingController.getGridColumns();

        setSavedHost(host);
        setInputHost(host);
        setGridColumns(columns);
        setSavedGridColumns(columns);

        if (auth) {
          setSavedUsername(auth.username);
          setInputUsername(auth.username);
          setSavedPassword(auth.password);
          setInputPassword(auth.password);
        }

        setCameras(savedCams);
        setSavedCameras(savedCams);

        // If we have a host but no cameras, try to fetch them
        if (host && savedCams.length === 0) {
          const frigateController = new FrigateController(host);
          const fetchedCameras = await frigateController.getCameras();
          setCameras(fetchedCameras);
          setSavedCameras(fetchedCameras);
          await settingController.setCameras(fetchedCameras);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Load on mount
    loadSettings();

    // Also reload when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadSettings();
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const hostChanged = inputHost !== savedHost;
    const authChanged =
      inputUsername !== savedUsername || inputPassword !== savedPassword;
    setHasUnsavedHostChanges(hostChanged || authChanged);
  }, [
    inputHost,
    savedHost,
    inputUsername,
    savedUsername,
    inputPassword,
    savedPassword,
  ]);

  React.useEffect(() => {
    // Check if cameras or grid columns have changed
    const camerasChanged =
      JSON.stringify(cameras) !== JSON.stringify(savedCameras);
    const gridChanged = gridColumns !== savedGridColumns;
    setHasUnsavedCameraChanges(camerasChanged || gridChanged);
  }, [cameras, savedCameras, gridColumns, savedGridColumns]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Instructions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info-outline" size={24} color="#2C2C2E" />
            <Text style={styles.cardTitle}>Getting Started</Text>
          </View>
          <Text style={styles.instructionText}>
            Enter your Frigate server URL below and tap Save to connect. The app
            will automatically discover your cameras.
          </Text>
          <Text style={styles.instructionSubtext}>
            Example: https://frigate.example.com or http://192.168.1.100:5000
          </Text>
        </View>

        {/* Server Configuration Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="dns" size={24} color="#2C2C2E" />
            <Text style={styles.cardTitle}>Frigate Server</Text>
          </View>
          <TextInput
            style={styles.input}
            onChangeText={setInputHost}
            value={inputHost}
            placeholder="https://frigate.example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
          />

          <Text style={styles.sectionLabel}>Authentication (Optional)</Text>
          <Text style={styles.sectionSubtext}>
            Required for Frigate instances with authentication enabled.
          </Text>

          <TextInput
            style={styles.input}
            onChangeText={setInputUsername}
            value={inputUsername}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            onChangeText={setInputPassword}
            value={inputPassword}
            placeholder="Password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!isLoading}
          />

          <Pressable
            style={[
              styles.saveButton,
              (!hasUnsavedHostChanges || isLoading) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasUnsavedHostChanges || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {hasUnsavedHostChanges ? "Save & Connect" : "Saved"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Display Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="view-module" size={24} color="#2C2C2E" />
            <Text style={styles.cardTitle}>Display Settings</Text>
          </View>
          <Text style={styles.sectionSubtext}>
            Adjust how cameras are displayed on the home screen.
          </Text>

          <Text style={styles.sectionLabel}>Grid Columns</Text>
          <View style={styles.gridColumnsContainer}>
            {[1, 2, 3].map((num) => (
              <Pressable
                key={num}
                style={[
                  styles.gridColumnButton,
                  gridColumns === num && styles.gridColumnButtonActive,
                ]}
                onPress={() => setGridColumns(num)}
              >
                <Text
                  style={[
                    styles.gridColumnButtonText,
                    gridColumns === num && styles.gridColumnButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cameras Section */}
        {cameras.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="videocam" size={24} color="#2C2C2E" />
              <Text style={styles.cardTitle}>Cameras ({cameras.length})</Text>
            </View>
            <Text style={styles.sectionSubtext}>
              Toggle cameras on or off to show or hide them on the home screen.
              Drag to reorder.
            </Text>
            <DraggableFlatList
              data={cameras}
              onDragEnd={({ data }) => setCameras(data)}
              keyExtractor={(item) => item.name}
              scrollEnabled={false}
              renderItem={({
                item,
                drag,
                isActive,
              }: RenderItemParams<Camera>) => (
                <ScaleDecorator>
                  <View
                    style={[
                      styles.cameraCard,
                      isActive && styles.cameraCardActive,
                    ]}
                  >
                    <Pressable onLongPress={drag} style={styles.dragHandle}>
                      <MaterialIcons
                        name="drag-indicator"
                        size={24}
                        color="#8e8e93"
                      />
                    </Pressable>
                    <Image
                      style={styles.cameraThumbnail}
                      source={{ uri: item.thumbnail }}
                    />
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraName}>
                        {item.name
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </Text>
                      {item.hlsStream && (
                        <Text style={styles.cameraDetail}>HLS Stream</Text>
                      )}
                      {item.mjpegStream && (
                        <Text style={styles.cameraDetail}>MJPEG Stream</Text>
                      )}
                    </View>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => toggleCamera(item)}
                      trackColor={{ false: "#d1d1d6", true: "#2C2C2E" }}
                      thumbColor="#fff"
                    />
                  </View>
                </ScaleDecorator>
              )}
            />
            <Pressable
              style={[
                styles.saveButton,
                styles.cameraSaveButton,
                (!hasUnsavedCameraChanges || isSavingCameras) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSaveCameras}
              disabled={!hasUnsavedCameraChanges || isSavingCameras}
            >
              {isSavingCameras ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {hasUnsavedCameraChanges ? "Save Camera Settings" : "Saved"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {cameras.length === 0 && savedHost && !isLoading && (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <MaterialIcons name="videocam-off" size={48} color="#d1d1d6" />
              <Text style={styles.emptyStateText}>No cameras found</Text>
              <Text style={styles.emptyStateSubtext}>
                Make sure your Frigate server is running and accessible.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  instructionText: {
    fontSize: 14,
    color: "#3c3c43",
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 12,
    color: "#8e8e93",
    fontStyle: "italic",
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d1d6",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraSaveButton: {
    marginTop: 16,
  },
  sectionSubtext: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 12,
  },
  gridColumnsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  gridColumnButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d1d6",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  gridColumnButtonActive: {
    borderColor: "#2C2C2E",
    backgroundColor: "#2C2C2E",
  },
  gridColumnButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8e8e93",
  },
  gridColumnButtonTextActive: {
    color: "#fff",
  },
  cameraCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f7",
    backgroundColor: "#fff",
  },
  cameraCardActive: {
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
  },
  cameraThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
  },
  cameraInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  cameraDetail: {
    fontSize: 12,
    color: "#8e8e93",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3c3c43",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 4,
    textAlign: "center",
  },
});
