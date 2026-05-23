export class AssetLoader {
  constructor(manifest) {
    this.manifest = new Map(manifest.map((entry) => [entry.id, entry]));
    this.images = new Map();
    this.states = new Map();
  }

  preload() {
    for (const asset of this.manifest.values()) {
      const image = new Image();
      this.states.set(asset.id, "loading");
      image.onload = () => this.states.set(asset.id, "loaded");
      image.onerror = () => this.states.set(asset.id, "error");
      image.src = asset.path;
      this.images.set(asset.id, image);
    }
  }

  get(id) {
    const state = this.states.get(id);
    if (state === "loaded") {
      return this.images.get(id);
    }
    return null;
  }

  getMeta(id) {
    return this.manifest.get(id) ?? null;
  }

  getFallback(id) {
    return this.getMeta(id)?.fallback ?? null;
  }
}
