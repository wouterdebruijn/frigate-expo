import * as React from "react";
import { Button, ImageComponent, StyleSheet, View } from "react-native";
import { Video, ResizeMode, AVPlaybackStatusSuccess } from "expo-av";
import { MaterialIcons } from '@expo/vector-icons'; 

export default function Player({ uri, onClick }: { uri: string, onClick: (uri: string) => void }) {
    const video = React.useRef<Video>(null);
    const [status, setStatus] = React.useState<{ isPlaying: boolean }>({ isPlaying: false });

    return (
        <View style={styles.view}>
            <Video
                ref={video}
                style={styles.video}
                source={{
                    uri: uri,
                }}
                resizeMode={ResizeMode.CONTAIN}
                isMuted={true}
                shouldPlay={true}
                useNativeControls={false}
                onPlaybackStatusUpdate={status => setStatus(() => status as AVPlaybackStatusSuccess)}
                onPointerDown={() => onClick(uri)}
            />
            <View style={styles.overlay}>
                <MaterialIcons
                    name="fullscreen"
                    size={24}
                    color="white"
                    onPress={() => onClick(uri)}    
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    video: {
        aspectRatio: 16 / 9,
        width: "100%",
        borderRadius: 5,
        position: "relative",
    },
    overlay: {
        position: "absolute",
        bottom: 4,
        right: 3,
        opacity: 0.8,
    },
    view: {
        paddingVertical: 2,
    }
});
