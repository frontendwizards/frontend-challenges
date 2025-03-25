import GameConfig from "../../config/GameConfig";
import { LoadResult } from "../asset/AssetLoader";

export default class AudioPlayer {
  private static coinCollectSound: HTMLAudioElement;

  public static loadSoundsAsync(): Promise<LoadResult> {
    return new Promise((resolve) => {
      this.coinCollectSound = new Audio(GameConfig.COIN_SOUND_PATH);
      resolve({ success: true, name: "coinCollectSound" });
    });
  }

  public static playCoinCollectSound(): void {
    console.log("playing coin collect sound");
    // this.coinCollectSound.volume = 0.5;
    // this.coinCollectSound
    //   .play()
    //   .catch((e) => console.warn("Could not play coin sound", e));
  }
}
