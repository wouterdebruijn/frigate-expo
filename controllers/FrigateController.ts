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
    const response = await fetch(`${this.host}/api/config`);
    const config = await response.json() as Config;

    const cameras = Object.keys(config.cameras).map((key) => {
        const camera = config.cameras[key];
        return {
            name: key,
            enabled: false,
            unavailable: false,
            stream: camera.live.stream_name
        }
    });

    return cameras;
  }
}
