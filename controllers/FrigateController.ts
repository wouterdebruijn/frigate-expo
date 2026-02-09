import { Alert } from "react-native";
import { Camera, SettingController, AuthData } from "./SettingsController";

interface FrigateCamera {
  live: {
    stream_name: string;
  };
}

interface Config {
  cameras: {
    [key: string]: FrigateCamera;
  };
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class FrigateController {
  host: string;
  settingsController: SettingController;

  constructor(url: string) {
    this.host = url;
    this.settingsController = new SettingController();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${this.host}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        console.error("Login failed:", response.statusText);
        return false;
      }

      const data = (await response.json()) as LoginResponse;
      await this.settingsController.updateToken(
        data.access_token,
        data.expires_in,
      );
      return true;
    } catch (e) {
      console.error("Error during login:", e);
      return false;
    }
  }

  async getValidToken(): Promise<string | null> {
    const auth = await this.settingsController.getAuth();
    if (!auth) return null;

    // Check if token exists and is still valid
    if (auth.token && auth.tokenExpiry && auth.tokenExpiry > Date.now()) {
      return auth.token;
    }

    // Try to refresh token by logging in again
    if (auth.username && auth.password) {
      const success = await this.login(auth.username, auth.password);
      if (success) {
        const updatedAuth = await this.settingsController.getAuth();
        return updatedAuth?.token || null;
      }
    }

    return null;
  }

  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await this.getValidToken();

    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  async getCameras(): Promise<Camera[]> {
    try {
      console.log(`Fetching cameras from Frigate at ${this.host}/api/config`);
      const response = await this.makeAuthenticatedRequest(
        `${this.host}/api/config`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const config = (await response.json()) as Config;

      const cameras = Object.keys(config.cameras).map((key) => {
        const camera = config.cameras[key];
        // Frigate 0.16.4 with go2rtc - use HLS stream with mp4=flac codec
        const hlsStream = `${this.host}/api/go2rtc/api/stream.m3u8?src=${key}&mp4=flac`;
        const mjpegStream = `${this.host}/api/${key}`;

        return {
          name: key,
          enabled: false,
          unavailable: false,
          stream: hlsStream,
          streamType: "hls" as const,
          hlsStream: hlsStream,
          mjpegStream: mjpegStream,
          thumbnail: `${this.host}/api/${key}/latest.jpg?h=200`,
        };
      });

      return cameras;
    } catch (e) {
      Alert.alert("Error", "Unable to fetch cameras from Frigate");
      console.error("Error fetching cameras from Frigate:", e);
      return [];
    }
  }
}
