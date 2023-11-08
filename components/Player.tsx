import * as React from "react";
import { Button, ImageComponent, StyleSheet, View } from "react-native";
import { Video, ResizeMode, AVPlaybackStatusSuccess } from "expo-av";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons'; 

export default function Player({ uri, onClick }: { uri: string, onClick: (uri: string) => void }) {
    const video = React.useRef<Video>(null);
    const [status, setStatus] = React.useState<{ isPlaying: boolean }>({ isPlaying: false });

    return (
        <View>
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
                    size={32}
                    color="black"
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
        bottom: 0,
        right: 0,
        opacity: 0.8,
    },
});
