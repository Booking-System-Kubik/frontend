import React from "react";
import type { Preset } from "../../model/types";

interface PresetsPanelProps {
  presets: Preset[];
  onPresetDragStart: (preset: Preset, clientX: number, clientY: number) => void;
  onAddCustomPreset: () => void;
}

export const PresetsPanel: React.FC<PresetsPanelProps> = ({
  presets,
  onPresetDragStart,
  onAddCustomPreset,
}) => {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Пресеты</h3>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <div
            key={preset.id}
            onMouseDown={(e) => {
              e.preventDefault();
              onPresetDragStart(preset, e.clientX, e.clientY);
            }}
            className="p-3 bg-white border border-gray-200 cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors rounded-lg"
          >
            <div className="w-full h-12 flex items-center justify-center mb-2 bg-slate-50">
              {preset.type === "rect" ? (
                <div
                  style={{
                    width: Math.max(18, Math.min(44, (preset.width ?? 40) * 0.5)),
                    height: Math.max(12, Math.min(28, (preset.height ?? 30) * 0.5)),
                    background: "#e0f2fe",
                    borderRadius: "3px",
                    border: "1px solid #0f172a",
                  }}
                />
              ) : (
                (() => {
                  const poly = preset.poly || [
                    [0, 0],
                    [40, 0],
                    [40, 40],
                    [0, 40],
                  ];
                  const xs = poly.map((p) => p[0]);
                  const ys = poly.map((p) => p[1]);
                  const minX = Math.min(...xs);
                  const maxX = Math.max(...xs);
                  const minY = Math.min(...ys);
                  const maxY = Math.max(...ys);
                  const width = maxX - minX || 1;
                  const height = maxY - minY || 1;
                  const boxWidth = 44;
                  const boxHeight = 28;
                  const scale = Math.min(boxWidth / width, boxHeight / height);
                  const offsetX = (48 - width * scale) / 2;
                  const offsetY = (32 - height * scale) / 2;

                  const points = poly
                    .map(([x, y]) => {
                      const nx = (x - minX) * scale + offsetX;
                      const ny = (y - minY) * scale + offsetY;
                      return `${nx},${ny}`;
                    })
                    .join(" ");

                  return (
                    <svg width={48} height={32}>
                      <polygon
                        points={points}
                        fill="#e0f2fe"
                        stroke="#0f172a"
                        strokeWidth={1.5}
                      />
                    </svg>
                  );
                })()
              )}
            </div>
            <div className="text-center text-xs font-medium text-gray-700">
              {preset.name}
            </div>
          </div>
        ))}

        <button
          onClick={onAddCustomPreset}
          className="p-3 bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
        >
          <span className="text-xl text-gray-400 mb-1">+</span>
          <span className="text-xs font-medium text-gray-600">Своя</span>
        </button>
      </div>
    </div>
  );
};

