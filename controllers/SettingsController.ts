import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Camera {
  name: string;
  enabled: boolean;
  unavailable: boolean;
  stream: string;
  thumbnail: string;
}

export class SettingController {
  async setCameras(cameras: Camera[]) {
    await AsyncStorage.setItem("cameras", JSON.stringify(cameras));
  }

  async getCameras(): Promise<Camera[]> {
    const cameras = await AsyncStorage.getItem("cameras");
    return cameras ? JSON.parse(cameras) : [];
  }

  async setHost(host: string) {
    await AsyncStorage.setItem("host", host);
  }

  async getHost(): Promise<string> {
    return await AsyncStorage.getItem("host") ?? "";
  }
}
