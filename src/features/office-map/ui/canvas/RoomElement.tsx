import React from "react";
import type { Room } from "../../model/types";

interface RoomElementProps {
  room: Room;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, room: Room) => void;
  onResizeMouseDown: (e: React.MouseEvent, room: Room) => void;
  editMode?: boolean;
}

export const RoomElement: React.FC<RoomElementProps> = ({
  room,
  isSelected,
  zoom,
  onMouseDown,
  onResizeMouseDown,
  editMode = true,
}) => {
  // Плоский 2D-режим, ближе к классическому плану офиса
  const roomWidth = room.width || 50;
  const roomHeight = room.height || 30;

  return (
    <g transform={`translate(${room.x},${room.y})`} style={{ cursor: "pointer" }}>
      {room.shape ? (
        <>
          <polygon
            points={room.shape.map((pt) => `${pt[0]},${pt[1]}`).join(" ")}
            fill={isSelected ? "#e0f2fe" : "#ffffff"}
            stroke="#111827"
            strokeWidth={1.5 / zoom}
            onMouseDown={(e) => onMouseDown(e, room)}
            onClick={(e) => {
              e.stopPropagation();
              onMouseDown(e, room);
            }}
          />
        </>
      ) : (
        <>
          <rect
            x={0}
            y={0}
            width={roomWidth}
            height={roomHeight}
            rx={4}
            ry={4}
            fill={isSelected ? "#e0f2fe" : "#ffffff"}
            stroke="#111827"
            strokeWidth={1.5 / zoom}
            onMouseDown={(e) => onMouseDown(e, room)}
            onClick={(e) => {
              e.stopPropagation();
              onMouseDown(e, room);
            }}
          />
        </>
      )}

      {/* Текст по центру */}
      <text
        x={roomWidth / 2}
        y={roomHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={12 / zoom}
        fontWeight="600"
        fill={isSelected ? "#1e3a8a" : "#0f172a"}
        pointerEvents="none"
      >
        {room.name}
      </text>

      {/* Ручка изменения размера (для всех фигур, в т.ч. кастомных) */}
      {editMode && (
        <rect
          x={roomWidth - 8}
          y={roomHeight - 8}
          width={8}
          height={8}
          rx={1.5}
          ry={1.5}
          fill="#2563eb"
          onMouseDown={(e) => onResizeMouseDown(e, room)}
          style={{ cursor: "nwse-resize" }}
        />
      )}
    </g>
  );
};

