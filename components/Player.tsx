import * as React from "react";
import { Button, Image, StyleSheet, View, Text, Pressable } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";

interface PlayerProps {
  uri: string;
  streamType?: "hls" | "mjpeg";
  mjpegFallback?: string;
  snapshotUrl: string;
  onClick: (uri: string) => void;
}

export default function Player({
  uri,
  streamType,
  mjpegFallback,
  snapshotUrl,
  onClick,
}: PlayerProps) {
  const [isPlayingVideo, setIsPlayingVideo] = React.useState(false);
  const [currentStreamType, setCurrentStreamType] = React.useState<
    "hls" | "mjpeg"
  >(streamType || "hls");
  const [hasError, setHasError] = React.useState(false);

  const currentUri = currentStreamType === "mjpeg" ? mjpegFallback || uri : uri;
  const shouldUseVideo = currentStreamType !== "mjpeg" && isPlayingVideo;

  // Use MJPEG stream for low bandwidth preview, HLS for full video
  const lowBandwidthUri = mjpegFallback || snapshotUrl;

  const player = useVideoPlayer(
    shouldUseVideo ? currentUri : null,
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    },
  );

  // Auto-revert to low bandwidth stream after 30 seconds of inactivity
  React.useEffect(() => {
    if (!isPlayingVideo) return;

    const timeout = setTimeout(() => {
      setIsPlayingVideo(false);
    }, 30000);

    return () => clearTimeout(timeout);
  }, [isPlayingVideo]);

  // Monitor player status and handle errors
  React.useEffect(() => {
    if (!player || !shouldUseVideo) return;

    const subscription = player.addListener("statusChange", (status) => {
      console.log(`Player status for ${uri}:`, status);
      if (status.error) {
        console.error(`HLS stream error for ${uri}:`, status.error);
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

  const handleClick = () => {
    if (!isPlayingVideo) {
      setIsPlayingVideo(true);
    } else {
      onClick(currentUri);
    }
  };

  return (
    <View style={styles.view}>
      <View style={styles.videoContainer}>
        {!isPlayingVideo ? (
          <Pressable onPress={handleClick} style={styles.videoContent}>
            <WebView
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                      <style>
                        body, html {
                          margin: 0;
                          padding: 0;
                          width: 100%;
                          height: 100%;
                          overflow: hidden;
                          background-color: #000;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        img {
                          max-width: 100%;
                          max-height: 100%;
                          object-fit: contain;
                        }
                      </style>
                    </head>
                    <body>
                      <img src="${lowBandwidthUri}" />
                    </body>
                  </html>
                `,
              }}
              style={styles.videoContent}
              scrollEnabled={false}
              bounces={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error(
                  `Failed to load MJPEG stream: ${lowBandwidthUri}`,
                  nativeEvent,
                );
              }}
            />
          </Pressable>
        ) : currentStreamType === "mjpeg" ? (
          <Pressable onPress={handleClick} style={styles.videoContent}>
            <WebView
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                      <style>
                        body, html {
                          margin: 0;
                          padding: 0;
                          width: 100%;
                          height: 100%;
                          overflow: hidden;
                          background-color: #000;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        img {
                          max-width: 100%;
                          max-height: 100%;
                          object-fit: contain;
                        }
                      </style>
                    </head>
                    <body>
                      <img src="${currentUri}" />
                    </body>
                  </html>
                `,
              }}
              style={styles.videoContent}
              scrollEnabled={false}
              bounces={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error(
                  `Failed to load MJPEG stream: ${currentUri}`,
                  nativeEvent,
                );
              }}
            />
          </Pressable>
        ) : (
          player && (
            <VideoView
              player={player}
              style={styles.videoContent}
              contentFit="contain"
              nativeControls={false}
              onPointerDown={handleClick}
            />
          )
        )}
        <View style={styles.overlay}>
          <MaterialIcons
            name="fullscreen"
            size={24}
            color="white"
            onPress={() => onClick(uri)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    aspectRatio: 16 / 9,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoContent: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    opacity: 0.8,
  },
  view: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
