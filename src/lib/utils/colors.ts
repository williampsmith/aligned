const FALCON_SHADES = [
  "#7d5766", // falcon-600
  "#ab7c8e", // falcon-400
  "#624450", // falcon-700
  "#916777", // falcon-500
  "#ceb7bf", // falcon-200
  "#bc99a6", // falcon-300
  "#452f37", // falcon-800
  "#e5d9dd", // falcon-100
  "#28191f", // falcon-900
  "#180e12", // falcon-950
  "#f4f0f1", // falcon-50
  "#7d5766", // wrap
];

export function getValueColor(index: number): string {
  return FALCON_SHADES[index % FALCON_SHADES.length];
}

export function getValueColorMap(valueIds: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  valueIds.forEach((id, i) => {
    map[id] = FALCON_SHADES[i % FALCON_SHADES.length];
  });
  return map;
}

export function getContrastText(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#180e12" : "#f4f0f1";
}
