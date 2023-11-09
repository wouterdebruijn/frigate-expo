import { Alert } from "react-native";
import { Camera } from "./SettingsController";

interface FrigateCamera {
    live: {
        stream_name: string;
    }
}

interface Config {
    cameras: {
        [key: string]: FrigateCamera;
    }
}

export class FrigateController {
  host: string;

  constructor(url: string) {
    this.host = url;
  }

  async getCameras(): Promise<Camera[]> {
    try {
      const response = await fetch(`${this.host}/api/config`);
      const config = await response.json() as Config;
  
      const cameras = Object.keys(config.cameras).map((key) => {
          const camera = config.cameras[key];
          return {
              name: key,
              enabled: false,
              unavailable: false,
              stream: `${this.host}/live/webrtc/api/stream.mp4?src=${camera.live.stream_name}&video=h264`,
              thumbnail: `${this.host}/api/${key}/latest.jpg?h=200`,
          }
      });
  
      return cameras;
    } catch (e) {
      Alert.alert("Error", "Unable to fetch cameras from Frigate");
      return [];
    }
  }
}
