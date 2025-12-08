import { Audio } from 'expo-av';

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private _enabled: boolean = true;

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  async load(name: string, filePath: any) {
    try {
      const { sound } = await Audio.Sound.createAsync(filePath);
      this.sounds.set(name, sound);
      console.log(`Sound loaded: ${name}`);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  async play(name: string) {
    if (!this.enabled) return;

    const soundObject = this.sounds.get(name);
    if (!soundObject) {
      console.warn(`Sound ${name} not loaded`);
      return;
    }

    try {
      await soundObject.setPositionAsync(0); 
      await soundObject.playAsync();
    } catch (error) {
      console.warn(`Play failed for ${name}:`, error);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  async unloadAll() {
    for (const [name, sound] of this.sounds) {
      await sound.unloadAsync().catch(() => {});
    }
    this.sounds.clear();
  }
}

export const sound = new SoundManager();

const loadSounds = async () => {
  await sound.load('eat', require('../assets/sounds/eat.mp3'));
  await sound.load('game-over', require('../assets/sounds/game-over.mp3'));
  await sound.load('achievement', require('../assets/sounds/achievement.mp3'));
  await sound.load('powerup', require('../assets/sounds/powerup.mp3'));
};

loadSounds(); 

export default sound;