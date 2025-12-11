import { Component, useState, onWillUnmount } from "@odoo/owl";
import { SpreadsheetChildEnv } from "../../types";
import { css } from "../helpers/css";

css/* scss */`
  .o-zoom-control {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    user-select: none;
    
    .o-zoom-button {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #dadce0;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        background: #f8f9fa;
        border-color: #bdc1c6;
      }
      
      &:active:not(:disabled) {
        background: #e8eaed;
      }
      
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    
    .o-zoom-slider-container {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .o-zoom-slider {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: #dadce0;
        border-radius: 2px;
        outline: none;
        cursor: pointer;
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #1a73e8;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            transform: scale(1.2);
          }
        }
        
        &::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #1a73e8;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
    
    .o-zoom-value {
      min-width: 40px;
      text-align: center;
      font-size: 12px;
      color: #5f6368;
      font-weight: 500;
    }
    
    .o-zoom-reset {
      font-size: 11px;
      color: #1a73e8;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 3px;
      
      &:hover {
        background: #f1f3f4;
      }
    }
  }
`;

interface Props {
  compact?: boolean;
}

export class ZoomControl extends Component<Props, SpreadsheetChildEnv> {
  static template = "o-spreadsheet-ZoomControl";
  
  state = useState({
    zoom: 100,
  });

  setup() {
    this.updateZoom();
    this.env.model.on("update", this, this.updateZoom);
    onWillUnmount(() => {
      this.env.model.off("update", this);
    });
  }

  updateZoom() {
    this.state.zoom = this.env.model.getters.getActiveSheetZoom();
  }

  get minZoom() {
    return this.env.model.getters.getMinZoom();
  }

  get maxZoom() {
    return this.env.model.getters.getMaxZoom();
  }

  get canZoomIn() {
    const sheetId = this.env.model.getters.getActiveSheetId();
    return this.env.model.getters.canZoomIn(sheetId);
  }

  get canZoomOut() {
    const sheetId = this.env.model.getters.getActiveSheetId();
    return this.env.model.getters.canZoomOut(sheetId);
  }

  onZoomIn() {
    this.env.model.dispatch("ZOOM_IN", {});
  }

  onZoomOut() {
    this.env.model.dispatch("ZOOM_OUT", {});
  }

  onSliderChange(ev: Event) {
    const value = parseInt((ev.target as HTMLInputElement).value);
    this.env.model.dispatch("SET_ZOOM_LEVEL", { level: value });
  }

  onResetZoom() {
    const sheetId = this.env.model.getters.getActiveSheetId();
    this.env.model.dispatch("RESET_ZOOM", { sheetId });
  }

  onZoomValueClick() {
    const value = prompt(
      `Enter zoom level (${this.minZoom}-${this.maxZoom}%):`,
      String(this.state.zoom)
    );
    if (value !== null) {
      const zoom = parseInt(value);
      if (!isNaN(zoom)) {
        this.env.model.dispatch("SET_ZOOM_LEVEL", { level: zoom });
      }
    }
  }
}

ZoomControl.props = {
  compact: { type: Boolean, optional: true },
};