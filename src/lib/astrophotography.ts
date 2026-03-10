export interface AstroAnalysis {
  blurScore: number; // 0-100, higher = sharper
  starDensity: number; // estimated stars per frame
  brightnessScore: number; // 0-100
  noiseLevel: number; // 0-100
  framingQuality: string;
  exposureHint: string;
  suggestions: string[];
  targets: { name: string; type: string; difficulty: string }[];
}

export function analyzeAstroImage(imageData: ImageData): AstroAnalysis {
  const { data, width, height } = imageData;
  
  // Calculate average brightness
  let totalBrightness = 0;
  let brightPixels = 0;
  let darkPixels = 0;
  const sampleStep = 2;

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const i = (y * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      if (brightness > 180) brightPixels++;
      if (brightness < 30) darkPixels++;
    }
  }

  const totalSamples = Math.ceil(width / sampleStep) * Math.ceil(height / sampleStep);
  const avgBrightness = totalBrightness / totalSamples;
  const brightnessScore = Math.round((avgBrightness / 255) * 100);

  // Estimate star density from bright isolated pixels
  const starDensity = Math.min(200, brightPixels);

  // Blur estimation via edge detection (Laplacian approximation)
  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const getGray = (px: number, py: number) => {
        const idx = (py * width + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };
      const laplacian = Math.abs(
        -4 * getGray(x, y) + getGray(x - 1, y) + getGray(x + 1, y) + getGray(x, y - 1) + getGray(x, y + 1)
      );
      edgeSum += laplacian;
      edgeCount++;
    }
  }
  const avgEdge = edgeSum / edgeCount;
  const blurScore = Math.min(100, Math.round(avgEdge * 3));

  // Noise estimation
  const darkRatio = darkPixels / totalSamples;
  const noiseLevel = darkRatio > 0.5 ? Math.round((1 - darkRatio) * 60 + 20) : Math.round((1 - darkRatio) * 100);

  // Framing quality
  let framingQuality: string;
  if (darkRatio > 0.7 && starDensity > 10) framingQuality = "Excellent — dark sky with good star density";
  else if (darkRatio > 0.5) framingQuality = "Good — moderate darkness with visible stars";
  else if (darkRatio > 0.3) framingQuality = "Fair — some light pollution detected";
  else framingQuality = "Poor — significant light pollution or overexposed";

  // Exposure hints
  let exposureHint: string;
  if (avgBrightness < 30) exposureHint = "Image is underexposed. Try longer exposure or higher ISO.";
  else if (avgBrightness < 80) exposureHint = "Good exposure for dark sky imaging.";
  else if (avgBrightness < 150) exposureHint = "Slightly bright. Consider reducing exposure time or ISO.";
  else exposureHint = "Overexposed. Reduce exposure time significantly.";

  // Suggestions
  const suggestions: string[] = [];
  if (blurScore < 40) suggestions.push("Use a sturdy tripod and remote shutter release to reduce blur.");
  if (blurScore < 20) suggestions.push("Consider using a star tracker for sharp star points in long exposures.");
  if (noiseLevel > 60) suggestions.push("Stack multiple exposures to reduce noise (try 20-30 frames).");
  if (brightnessScore > 60) suggestions.push("Use a light pollution filter to darken the sky background.");
  if (starDensity < 5) suggestions.push("Point toward the Milky Way for richer star fields.");
  if (suggestions.length === 0) suggestions.push("Great image! Consider experimenting with different focal lengths.");
  suggestions.push("Shoot in RAW format for maximum post-processing flexibility.");

  // Recommended targets
  const targets = [
    { name: "Orion Nebula (M42)", type: "Nebula", difficulty: "Beginner" },
    { name: "Andromeda Galaxy (M31)", type: "Galaxy", difficulty: "Beginner" },
    { name: "Pleiades (M45)", type: "Cluster", difficulty: "Beginner" },
    { name: "Lagoon Nebula (M8)", type: "Nebula", difficulty: "Intermediate" },
    { name: "Ring Nebula (M57)", type: "Planetary Nebula", difficulty: "Advanced" },
    { name: "Whirlpool Galaxy (M51)", type: "Galaxy", difficulty: "Advanced" },
  ];

  return {
    blurScore,
    starDensity,
    brightnessScore,
    noiseLevel,
    framingQuality,
    exposureHint,
    suggestions,
    targets,
  };
}

export function analyzeFromFile(file: File): Promise<AstroAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 600;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(analyzeAstroImage(imageData));
    };
    img.src = url;
  });
}
