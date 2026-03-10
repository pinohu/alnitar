/**
 * Share Card Service
 * 
 * Generates social discovery cards.
 * Template-based for affordability — no server-side image generation needed.
 * Card metadata stored in DB, generated images in storage.
 */

import { type Constellation } from "@/data/constellations";

export type ShareCardFormat = "square" | "story" | "landscape";

export interface ShareCardData {
  constellation: Constellation;
  confidence: number;
  format: ShareCardFormat;
  funFact?: string;
  detectedStars?: number;
  timestamp?: string;
}

export interface ShareCardDimensions {
  width: number;
  height: number;
}

export class ShareCardService {
  static getDimensions(format: ShareCardFormat): ShareCardDimensions {
    switch (format) {
      case "square": return { width: 1080, height: 1080 };
      case "story": return { width: 1080, height: 1920 };
      case "landscape": return { width: 1920, height: 1080 };
    }
  }

  /**
   * Generate a share card as a canvas element.
   * Uses client-side canvas rendering — no server needed.
   */
  static async generateCanvas(data: ShareCardData): Promise<HTMLCanvasElement> {
    const { width, height } = this.getDimensions(data.format);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#0a1628");
    grad.addColorStop(0.5, "#0d1f3c");
    grad.addColorStop(1, "#0a1628");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
      ctx.fill();
    }

    // Constellation name
    const fontSize = data.format === "story" ? 64 : 56;
    ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    const nameY = data.format === "story" ? height * 0.35 : height * 0.4;
    ctx.fillText(data.constellation.name, width / 2, nameY);

    // Confidence
    ctx.font = `${fontSize * 0.5}px Inter, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(`${data.confidence}% confidence`, width / 2, nameY + fontSize * 0.8);

    // Fun fact
    if (data.funFact) {
      ctx.font = `${Math.round(fontSize * 0.35)}px Inter, sans-serif`;
      ctx.fillStyle = "rgba(255, 220, 100, 0.9)";
      const factY = nameY + fontSize * 1.6;
      const words = data.funFact.split(" ");
      let line = "";
      let lineY = factY;
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > width * 0.8) {
          ctx.fillText(line.trim(), width / 2, lineY);
          line = word + " ";
          lineY += fontSize * 0.45;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), width / 2, lineY);
    }

    // Branding
    ctx.font = `bold ${Math.round(fontSize * 0.4)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
    ctx.fillText("Discovered with Alnitar 🔭", width / 2, height - 40);

    return canvas;
  }

  /** Generate and download a share card */
  static async downloadCard(data: ShareCardData): Promise<void> {
    const canvas = await this.generateCanvas(data);
    const link = document.createElement("a");
    link.download = `alnitar-${data.constellation.id}-${data.format}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  /** Generate a blob for uploading */
  static async toBlob(data: ShareCardData): Promise<Blob> {
    const canvas = await this.generateCanvas(data);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    });
  }
}
