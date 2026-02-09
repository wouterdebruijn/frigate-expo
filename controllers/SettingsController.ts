import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Camera {
  name: string;
  enabled: boolean;
  unavailable: boolean;
  stream: string;
  streamType: "hls" | "mjpeg";
  hlsStream?: string;
  mjpegStream?: string;
  thumbnail: string;
}

export interface AuthData {
  username: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
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
    // Remove trailing slash to ensure consistent URL formatting
    const normalizedHost = host.replace(/\/+$/, "");
    await AsyncStorage.setItem("host", normalizedHost);
  }

  async getHost(): Promise<string> {
    return (await AsyncStorage.getItem("host")) ?? "";
  }

  async setAuth(username: string, password: string) {
    const authData: AuthData = { username, password };
    await AsyncStorage.setItem("auth", JSON.stringify(authData));
  }

  async getAuth(): Promise<AuthData | null> {
    const auth = await AsyncStorage.getItem("auth");
    return auth ? JSON.parse(auth) : null;
  }

  async clearAuth() {
    await AsyncStorage.removeItem("auth");
  }

  async updateToken(token: string, expiresIn: number) {
    const auth = await this.getAuth();
    if (auth) {
      auth.token = token;
      auth.tokenExpiry = Date.now() + expiresIn * 1000;
      await AsyncStorage.setItem("auth", JSON.stringify(auth));
    }
  }

  async setGridColumns(columns: number) {
    await AsyncStorage.setItem("gridColumns", columns.toString());
  }

  async getGridColumns(): Promise<number> {
    const columns = await AsyncStorage.getItem("gridColumns");
    return columns ? parseInt(columns, 10) : 1; // Default to 1 column
  }
}
