import { UIPlugin } from "../ui_plugin";

const ZOOM_STEP = 10; // Default zoom step percentage

export class ZoomUIPlugin extends UIPlugin {
  static getters = ["getActiveSheetZoom", "getZoomScale"] as const;

  handle(cmd: any) {
    const sheetId = this.getters.getActiveSheetId();
    
    switch (cmd.type) {
      case "ZOOM_IN": {
        const currentZoom = this.getters.getZoom(sheetId);
        const step = cmd.step || ZOOM_STEP;
        const newZoom = Math.min(
          currentZoom + step,
          this.getters.getMaxZoom()
        );
        this.dispatch("SET_ZOOM", { sheetId, zoom: newZoom });
        break;
      }
      case "ZOOM_OUT": {
        const currentZoom = this.getters.getZoom(sheetId);
        const step = cmd.step || ZOOM_STEP;
        const newZoom = Math.max(
          currentZoom - step,
          this.getters.getMinZoom()
        );
        this.dispatch("SET_ZOOM", { sheetId, zoom: newZoom });
        break;
      }
      case "SET_ZOOM_LEVEL": {
        const zoom = Math.max(
          this.getters.getMinZoom(),
          Math.min(cmd.level, this.getters.getMaxZoom())
        );
        this.dispatch("SET_ZOOM", { sheetId, zoom });
        break;
      }
    }
  }

  // Getters
  getActiveSheetZoom(): number {
    return this.getters.getZoom(this.getters.getActiveSheetId());
  }

  getZoomScale(): number {
    return this.getActiveSheetZoom() / 100;
  }
}