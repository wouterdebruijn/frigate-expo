import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import MjpegWebView from "./MjpegWebView";

interface PlayerProps {
  uri: string;
  streamType?: "hls" | "mjpeg";
  mjpegFallback?: string;
  snapshotUrl: string;
  onClick: (uri: string) => void;
  onClose?: () => void;
}

export default function Player({
  uri,
  streamType,
  mjpegFallback,
  snapshotUrl,
  onClick,
  onClose,
}: PlayerProps) {
  // In fullscreen, always play video immediately
  const [currentStreamType, setCurrentStreamType] = React.useState<
    "hls" | "mjpeg"
  >(streamType || "hls");
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const insets = useSafeAreaInsets();

  // Zoom and pan gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const currentUri = currentStreamType === "mjpeg" ? mjpegFallback || uri : uri;
  const shouldUseVideo = currentStreamType !== "mjpeg";

  const player = useVideoPlayer(
    shouldUseVideo ? currentUri : null,
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    },
  );

  // Monitor player status and handle errors
  React.useEffect(() => {
    if (!player || !shouldUseVideo) {
      setIsLoading(false);
      return;
    }

    const subscription = player.addListener("statusChange", (status) => {
      console.log(`Fullscreen player status for ${uri}:`, status);

      // Update loading state based on player status
      if (status.status === "loading") {
        setIsLoading(true);
      } else if (status.status === "idle" || status.status === "error") {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }

      if (status.error) {
        console.error(`HLS stream error for ${uri}:`, status.error);
        setIsLoading(false);
        if (mjpegFallback && currentStreamType === "hls") {
          console.log(`Falling back to MJPEG: ${mjpegFallback}`);
          setCurrentStreamType("mjpeg");
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, uri, mjpegFallback, currentStreamType, shouldUseVideo]);

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Reset zoom if too small
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      // Limit max zoom
      if (scale.value > 5) {
        scale.value = withTiming(5);
        savedScale.value = 5;
      }
    });

  // Pan gesture for moving when zoomed
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .enabled(scale.value > 1);

  // Double tap to reset zoom
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      savedScale.value = 1;
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {currentStreamType === "mjpeg" ? (
        <MjpegWebView
          uri={currentUri}
          style={styles.video}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error(
              `Failed to load MJPEG stream: ${currentUri}`,
              nativeEvent,
            );
            setIsLoading(false);
          }}
        />
      ) : (
        player && (
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.video, animatedStyle]}>
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
                onPointerDown={() => onClick(currentUri)}
              />
            </Animated.View>
          </GestureDetector>
        )
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {onClose && (
        <Pressable
          style={[
            styles.closeButton,
            { top: Math.max(16, insets.top), left: Math.max(16, insets.left) },
          ]}
          onPress={onClose}
        >
          <MaterialIcons name="close" size={32} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
});
