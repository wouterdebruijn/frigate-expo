import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Camera {
  name: string;
  enabled: boolean;
  unavailable: boolean;
  stream: string;
}

export interface Settings {
  host: string;
  cameras: Camera[];
}

export class SettingController {
  async saveSettings(settings: Settings) {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem("settings", jsonValue);
    } catch (e) {
      // saving error
    }
  }

  async getSettings() {
    try {
      const jsonValue = await AsyncStorage.getItem("settings");
      if (jsonValue != null) {
        return JSON.parse(jsonValue) as Settings;
      }
    } catch (e) {
      // error reading value
    }
  }

  async resetSettings() {
    try {
      await AsyncStorage.removeItem("settings");
    } catch (e) {
      // error reading value
    }
  }
}
