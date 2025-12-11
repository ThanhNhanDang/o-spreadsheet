import { CorePlugin } from "../core_plugin";
import { CommandResult } from "../../types/commands";
import { UID } from "../../types";
import { WorkbookData } from "../../types/workbook_data";

// Zoom configuration per sheet
interface ZoomConfig {
  [sheetId: UID]: number;
}

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const DEFAULT_ZOOM = 100;

export class ZoomPlugin extends CorePlugin {
  static getters = [
    "getZoom",
    "getMinZoom",
    "getMaxZoom",
    "canZoomIn",
    "canZoomOut",
  ] as const;

  private zoom: ZoomConfig = {};

  allowDispatch(cmd: any): CommandResult | CommandResult[] {
    switch (cmd.type) {
      case "SET_ZOOM":
        if (cmd.zoom < MIN_ZOOM || cmd.zoom > MAX_ZOOM) {
          return CommandResult.InvalidViewportSize;
        }
        if (!this.getters.tryGetSheet(cmd.sheetId)) {
          return CommandResult.InvalidSheetId;
        }
        break;
      case "RESET_ZOOM":
        if (!this.getters.tryGetSheet(cmd.sheetId)) {
          return CommandResult.InvalidSheetId;
        }
        break;
    }
    return CommandResult.Success;
  }

  handle(cmd: any) {
    switch (cmd.type) {
      case "SET_ZOOM":
        this.zoom[cmd.sheetId] = Math.round(cmd.zoom);
        break;
      case "RESET_ZOOM":
        this.zoom[cmd.sheetId] = DEFAULT_ZOOM;
        break;
    }
  }

  // Getters
  getZoom(sheetId: UID): number {
    return this.zoom[sheetId] || DEFAULT_ZOOM;
  }

  getMinZoom(): number {
    return MIN_ZOOM;
  }

  getMaxZoom(): number {
    return MAX_ZOOM;
  }

  canZoomIn(sheetId: UID): boolean {
    return this.getZoom(sheetId) < MAX_ZOOM;
  }

  canZoomOut(sheetId: UID): boolean {
    return this.getZoom(sheetId) > MIN_ZOOM;
  }

  // Import/Export
  import(data: WorkbookData) {
    if (data.sheets) {
      for (const sheet of data.sheets) {
        if ((sheet as any).zoom !== undefined) {
          this.zoom[sheet.id] = (sheet as any).zoom;
        }
      }
    }
  }

  export(data: WorkbookData) {
    for (const sheet of data.sheets) {
      (sheet as any).zoom = this.getZoom(sheet.id);
    }
  }

  exportForExcel(data: any) {
    for (const sheet of data.sheets) {
      if (!sheet.sheetViews) {
        sheet.sheetViews = [{}];
      }
      sheet.sheetViews[0].zoomScale = this.getZoom(sheet.id);
    }
  }
}