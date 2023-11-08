import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Video, ResizeMode, AVPlaybackStatusSuccess } from "expo-av";


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
        </View>
    )
}

const styles = StyleSheet.create({
    video: {
        aspectRatio: 16 / 9,
        width: "100%",
        borderRadius: 5
    },
});
