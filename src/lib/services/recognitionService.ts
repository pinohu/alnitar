/**
 * Recognition Service
 * 
 * Handles the constellation recognition pipeline.
 * Heuristic recognition pipeline — modular for future astrometry.net integration.
 */

import { recognizeImage, type RecognitionOutput } from "@/lib/recognition";
import { db } from "@/lib/adapters/database";
import { storage, storagePath } from "@/lib/adapters/storage";

export interface RecognitionRequest {
  file: File;
  userId?: string;
}

export interface RecognitionSaveResult {
  observationId: string;
  imageUrl?: string;
}

export class RecognitionService {
  /**
   * Run the recognition pipeline on an uploaded image.
   * Currently uses the lightweight client-side pipeline.
   * Future: send to astrometry.net or ML backend.
   */
  static async recognize(file: File): Promise<RecognitionOutput> {
    return recognizeImage(file);
  }

  /**
   * Save a recognition result as an observation.
   * Stores metadata in DB, image in storage.
   */
  static async saveObservation(
    userId: string,
    output: RecognitionOutput,
    file?: File,
  ): Promise<RecognitionSaveResult> {
    const top = output.results[0];
    if (!top) throw new Error("No recognition results to save");

    let imageUrl: string | undefined;

    // Upload image to storage if available
    if (file) {
      const observationId = `obs-${Date.now()}`;
      const path = storagePath("upload", userId, observationId);
      const uploadResult = await storage.upload("sky-photos", path, file, file.type);
      if (!uploadResult.error) imageUrl = uploadResult.url;
    }

    // Save observation metadata to DB
    const result = await db.insert("observations", {
      user_id: userId,
      constellation_id: top.constellation.id,
      constellation_name: top.constellation.name,
      confidence: top.confidence,
      equipment: "phone",
      device_type: "phone",
      image_url: imageUrl,
      brightness_estimate: top.constellation.stars?.[0]?.magnitude,
      alternate_matches: output.results.slice(1, 4).map(r => ({
        id: r.constellation.id,
        name: r.constellation.name,
        confidence: r.confidence,
      })),
    });

    const inserted = result.data as Record<string, unknown> | null;
    return {
      observationId: (inserted?.id != null ? String(inserted.id) : undefined) ?? "",
      imageUrl,
    };
  }
}
