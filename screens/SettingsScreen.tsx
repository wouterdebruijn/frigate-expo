import * as React from "react";
import { StyleSheet, View, Text, Button, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Camera {
    name: string;
}

interface Settings {
    host: string;
    cameras: Camera[];
}

export default function SettingsScreen({ navigation }: { navigation: any }) {

    async function storeSettings(settings: Settings) {
        try {
            const jsonValue = JSON.stringify(settings)
            await AsyncStorage.setItem('settings', jsonValue)
        } catch (e) {
            // saving error
        }
    }

    async function getSettings() {
        try {
            const jsonValue = await AsyncStorage.getItem('settings')
            if (jsonValue != null) {
                return JSON.parse(jsonValue) as Settings;
            }
        } catch (e) {
            // error reading value
        }
    }

    const [host, setHost] = React.useState<string>("");
    const [camera, setCamera] = React.useState<string>("");


    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getSettings().then(settings => {
                console.log(settings);
                console.log(typeof settings);
                if (settings) {
                    setHost(settings.host);
                    setCamera(settings.cameras.map((camera) => camera.name).join(","));
                }
            });
        });

        return unsubscribe;
    });

    function saveSettings() {
        storeSettings({ host: host, cameras: camera.split(",").map((name) => { return { name: name } }) });
    }

    return (
        <View>
            <View style={styles.container}>
                <Text style={styles.title}>Host:</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={text => setHost(text)}
                    value={host}
                />
                <Text style={styles.title}>Cameras (temp):</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={text => setCamera(text)}
                    value={camera}
                />

            </View>
            <View style={styles.container}>
                <Button
                    title="Save"
                    onPress={() => saveSettings()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: "#fff"
    },
    title: {
    },
    textInput: {
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
    }
});
