import React, { useState } from "react";
import type { Room, Preset, ID } from "../../model/types";
import { GridBackground } from "./GridBackground";
import { BoundaryPolygon } from "./BoundaryPolygon";
import { RoomElement } from "./RoomElement";
import { DragOverlay } from "./DragOverlay";
import { ZoomControls } from "../controls/ZoomControls";
import { GRID_SIZE } from "../../lib/helpers";

interface OfficeCanvasProps {
  rooms: Room[];
  boundaryPoints: number[][];
  boundaryClosed: boolean;
  isDrawingBoundary: boolean;
  zoom: number;
  offset: { x: number; y: number };
  selectedRoomId: ID | null;
  selectedRoom: Room | null;
  roomSpaceTypes?: Record<string, number>;
  roomCapacities?: Record<string, number>;
  onCloseRoomInfo?: () => void;
  draggingPreset: Preset | null;
  draggingPresetPos: { x: number; y: number } | null;
  onCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onCanvasDblClick: (e: React.MouseEvent) => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onRoomMouseDown: (e: React.MouseEvent, room: Room) => void;
  onRoomResizeMouseDown: (e: React.MouseEvent, room: Room) => void;
  onRoomMove: (e: React.MouseEvent) => void;
  onRoomResize: (e: React.MouseEvent) => void;
  onRoomMoveEnd: () => void;
  onRoomResizeEnd: () => void;
  isMovingRoom: boolean;
  isResizing: boolean;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onRenameRoom?: (roomId: ID, newName: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  editMode?: boolean;
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
  rooms,
  boundaryPoints,
  boundaryClosed,
  isDrawingBoundary,
  zoom,
  offset,
  selectedRoomId,
  selectedRoom,
  roomSpaceTypes = {},
  roomCapacities = {},
  onCloseRoomInfo,
  draggingPreset,
  draggingPresetPos,
  onCanvasClick,
  onCanvasDblClick,
  onCanvasMouseDown,
  onWheel,
  onRoomMouseDown,
  onRoomResizeMouseDown,
  onRoomMove,
  onRoomResize,
  onRoomMoveEnd,
  onRoomResizeEnd,
  isMovingRoom,
  isResizing,
  wrapperRef,
  svgRef,
  onRenameRoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  editMode = true,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Вычисляем позицию попапа рядом с выбранной комнатой
  const getPopupPosition = () => {
    if (!selectedRoom || !svgRef.current || !wrapperRef.current) return null;
    
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    
    // Координаты комнаты в canvas координатах
    const roomX = selectedRoom.x;
    const roomY = selectedRoom.y;
    const roomWidth = selectedRoom.width || 50;
    
    // Преобразуем в экранные координаты
    const screenX = (roomX * zoom) + offset.x;
    const screenY = (roomY * zoom) + offset.y;
    
    // Позиция попапа справа от комнаты (или слева, если не помещается)
    const popupWidth = 280;
    const popupHeight = 120;
    const spacing = 10;
    
    let left = screenX + (roomWidth * zoom) + spacing;
    let top = screenY;
    
    // Если не помещается справа, показываем слева
    if (left + popupWidth > wrapperRect.width) {
      left = screenX - popupWidth - spacing;
    }
    
    // Если не помещается снизу, показываем сверху
    if (top + popupHeight > wrapperRect.height) {
      top = screenY - popupHeight;
    }
    
    // Ограничиваем границами контейнера
    left = Math.max(10, Math.min(left, wrapperRect.width - popupWidth - 10));
    top = Math.max(10, Math.min(top, wrapperRect.height - popupHeight - 10));
    
    return { left, top };
  };
  
  const popupPos = getPopupPosition();

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full overflow-hidden ${
        editMode ? "bg-white" : "bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100"
      }`}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          onCanvasMouseDown(e);
          onCanvasClick(e);
        }}
        onDoubleClick={onCanvasDblClick}
        onWheel={onWheel}
        style={{ userSelect: "none" }}
        className={editMode ? "bg-white" : "bg-transparent"}
      >
        {/* Сетка только в режиме редактирования */}
        {editMode && <GridBackground offset={offset} zoom={zoom} />}

        <g transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}>
          {boundaryPoints.length > 0 && (
            <BoundaryPolygon
              boundaryPoints={boundaryPoints}
              boundaryClosed={boundaryClosed}
              zoom={zoom}
            />
          )}

          {/* Разметка возможных позиций для перетаскиваемого пресета */}
          {draggingPreset && boundaryClosed && boundaryPoints.length > 2 && (
            <>
              {(() => {
                const xs = boundaryPoints.map((p) => p[0]);
                const ys = boundaryPoints.map((p) => p[1]);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                const presetWidth =
                  draggingPreset.type === "rect"
                    ? draggingPreset.width || 60
                    : (() => {
                        const poly = draggingPreset.poly || [[0, 0], [40, 0], [40, 40], [0, 40]];
                        const pxs = poly.map((p) => p[0]);
                        const pys = poly.map((p) => p[1]);
                        return Math.max(...pxs) - Math.min(...pxs) || 40;
                      })();

                const presetHeight =
                  draggingPreset.type === "rect"
                    ? draggingPreset.height || 60
                    : (() => {
                        const poly = draggingPreset.poly || [[0, 0], [40, 0], [40, 40], [0, 40]];
                        const pxs = poly.map((p) => p[0]);
                        const pys = poly.map((p) => p[1]);
                        return Math.max(...pys) - Math.min(...pys) || 40;
                      })();

                const centersX: number[] = [];
                const centersY: number[] = [];

                const startX = minX + presetWidth / 2;
                const endX = maxX - presetWidth / 2;
                for (let x = startX; x <= endX; x += GRID_SIZE) {
                  centersX.push(x);
                }

                const startY = minY + presetHeight / 2;
                const endY = maxY - presetHeight / 2;
                for (let y = startY; y <= endY; y += GRID_SIZE) {
                  centersY.push(y);
                }

                return (
                  <>
                    {centersX.map((cx) => (
                      <line
                        key={`v-${cx}`}
                        x1={cx}
                        y1={minY}
                        x2={cx}
                        y2={maxY}
                        stroke="#0f172a"
                        strokeWidth={0.5}
                        strokeDasharray="4,4"
                        opacity={0.25}
                      />
                    ))}
                    {centersY.map((cy) => (
                      <line
                        key={`h-${cy}`}
                        x1={minX}
                        y1={cy}
                        x2={maxX}
                        y2={cy}
                        stroke="#0f172a"
                        strokeWidth={0.5}
                        strokeDasharray="4,4"
                        opacity={0.25}
                      />
                    ))}
                  </>
                );
              })()}
            </>
          )}

          {rooms.map((room) => (
            <RoomElement
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              zoom={zoom}
              onMouseDown={onRoomMouseDown}
              onResizeMouseDown={onRoomResizeMouseDown}
              editMode={editMode}
            />
          ))}
        </g>
      </svg>

      <DragOverlay draggingPreset={draggingPreset} draggingPresetPos={draggingPresetPos} />

      {/* Попап с информацией о выбранной комнате */}
      {selectedRoom && popupPos && (
        <div
          className="absolute z-40 bg-white border-2 border-blue-400 shadow-xl pointer-events-auto"
          style={{
            left: `${popupPos.left}px`,
            top: `${popupPos.top}px`,
            width: '280px',
          }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 flex items-center justify-between gap-2">
            {editMode && onRenameRoom ? (
              isEditingName ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => {
                    const trimmed = draftName.trim();
                    if (trimmed && trimmed !== selectedRoom.name) {
                      onRenameRoom(selectedRoom.id, trimmed);
                    }
                    setIsEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      setIsEditingName(false);
                    }
                  }}
                  className="flex-1 bg-white/10 border border-white/30 rounded px-2 py-1 text-xs text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Название помещения"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(selectedRoom.name);
                    setIsEditingName(true);
                  }}
                  className="flex-1 text-left"
                  title="Изменить название помещения"
                >
                  <h3 className="font-bold text-white text-sm truncate underline decoration-white/40 decoration-dotted underline-offset-2">
                    {selectedRoom.name}
                  </h3>
                </button>
              )
            ) : (
              <h3 className="font-bold text-white text-sm truncate">{selectedRoom.name}</h3>
            )}
            {onCloseRoomInfo && (
              <button
                onClick={onCloseRoomInfo}
                className="text-white/80 hover:text-white transition-colors ml-2 flex-shrink-0"
                title="Закрыть"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Размер:</span>
              <span className="font-semibold text-gray-900">
                {Math.round(selectedRoom.width)} × {Math.round(selectedRoom.height)} м
              </span>
            </div>
            {roomSpaceTypes[selectedRoom.id] && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Тип ID:</span>
                <span className="font-semibold text-gray-900">{roomSpaceTypes[selectedRoom.id]}</span>
              </div>
            )}
            {roomCapacities[selectedRoom.id] && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Вместимость:</span>
                <span className="font-semibold text-blue-600">{roomCapacities[selectedRoom.id]} мест</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Управление масштабом */}
      {zoom !== undefined && onZoomIn && onZoomOut && onResetView && (
        <div className="absolute top-4 right-4 z-30 pointer-events-auto">
          <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onReset={onResetView} />
        </div>
      )}

      {/* Легенда по цветам и статусам помещений */}
      <div className="pointer-events-none absolute left-4 bottom-4 z-10 bg-white px-3 py-2 border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-sky-100 border border-sky-400" />
          <span>Помещение (доступно)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-sky-200 border border-sky-600" />
          <span>Выбранное помещение</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm border border-dashed border-sky-500" />
          <span>Контур этажа</span>
        </div>
      </div>

      <div
        onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          onRoomMove(e);
          onRoomResize(e);
        }}
        onMouseUp={() => {
          onRoomMoveEnd();
          onRoomResizeEnd();
        }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          pointerEvents: isMovingRoom || isResizing ? "auto" : "none",
          cursor: isResizing ? "nwse-resize" : isMovingRoom ? "move" : "default",
        }}
      />
    </div>
  );
};

