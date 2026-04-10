import { useState } from "react";
import type { Room, ID } from "../model/types";
import { clientToCanvasCoords, snapToGrid } from "../lib/helpers";

interface UseRoomInteractionParams {
  svgRef: React.RefObject<SVGSVGElement | null>;
  offset: { x: number; y: number };
  zoom: number;
  rooms: Room[];
  currentFloor: string;
  setFloors: React.Dispatch<React.SetStateAction<Record<string, Room[]>>>;
  editMode?: boolean;
}

export const useRoomInteraction = ({
  svgRef,
  offset,
  zoom,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rooms: _rooms,
  currentFloor,
  setFloors,
  editMode = true,
}: UseRoomInteractionParams) => {
  const [selectedRoomId, setSelectedRoomId] = useState<ID | null>(null);
  const [isMovingRoom, setIsMovingRoom] = useState(false);
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeRoomId, setResizeRoomId] = useState<ID | null>(null);

  const startMoveRoom = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    setSelectedRoomId(room.id);
    if (!editMode) return; // В режиме просмотра только выделяем, без перетаскивания
    setIsMovingRoom(true);
    const canvasP = clientToCanvasCoords({
      clientX: e.clientX,
      clientY: e.clientY,
      svgElement: svgRef.current,
      offset,
      zoom,
    });
    setMoveOffset({ x: canvasP.x - room.x, y: canvasP.y - room.y });
  };

  const onMoveDrag = (e: React.MouseEvent) => {
    if (!isMovingRoom || !selectedRoomId) return;
    const canvasP = clientToCanvasCoords({
      clientX: e.clientX,
      clientY: e.clientY,
      svgElement: svgRef.current,
      offset,
      zoom,
    });
    const targetX = canvasP.x - moveOffset.x;
    const targetY = canvasP.y - moveOffset.y;
    setFloors((prev) => ({
      ...prev,
      [currentFloor]: prev[currentFloor].map((r) =>
        r.id === selectedRoomId
          ? { ...r, x: snapToGrid(targetX), y: snapToGrid(targetY) }
          : r
      ),
    }));
  };

  const endMove = () => {
    setIsMovingRoom(false);
  };

  const startResize = (e: React.MouseEvent, room: Room) => {
    if (!editMode) return; // В режиме просмотра не изменяем размер
    e.stopPropagation();
    setResizeRoomId(room.id);
    setIsResizing(true);
  };

  const onResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !resizeRoomId) return;
    const canvasP = clientToCanvasCoords({
      clientX: e.clientX,
      clientY: e.clientY,
      svgElement: svgRef.current,
      offset,
      zoom,
    });
    setFloors((prev) => ({
      ...prev,
      [currentFloor]: prev[currentFloor].map((r) => {
        if (r.id !== resizeRoomId) return r;
        const rawW = canvasP.x - r.x;
        const rawH = canvasP.y - r.y;
        const snappedW = Math.max(20, snapToGrid(rawW));
        const snappedH = Math.max(20, snapToGrid(rawH));

        if (r.shape && r.shape.length > 0) {
          const xs = r.shape.map((p) => p[0]);
          const ys = r.shape.map((p) => p[1]);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          const oldW = maxX - minX || 1;
          const oldH = maxY - minY || 1;
          const scaleX = snappedW / oldW;
          const scaleY = snappedH / oldH;

          const newShape = r.shape.map(([x, y]) => [
            minX + (x - minX) * scaleX,
            minY + (y - minY) * scaleY,
          ]);

          return { ...r, width: snappedW, height: snappedH, shape: newShape };
        }

        return { ...r, width: snappedW, height: snappedH };
      }),
    }));
  };

  const endResize = () => {
    setIsResizing(false);
    setResizeRoomId(null);
  };

  const renameRoom = (roomId: ID, newName: string) => {
    setFloors((prev) => ({
      ...prev,
      [currentFloor]: prev[currentFloor].map((room) =>
        room.id === roomId ? { ...room, name: newName } : room
      ),
    }));
  };

  const deleteRoom = (roomId: ID) => {
    setFloors((prev) => ({
      ...prev,
      [currentFloor]: prev[currentFloor].filter((x) => x.id !== roomId),
    }));
    if (selectedRoomId === roomId) setSelectedRoomId(null);
  };

  return {
    selectedRoomId,
    isMovingRoom,
    isResizing,
    setSelectedRoomId,
    startMoveRoom,
    onMoveDrag,
    endMove,
    startResize,
    onResizeMove,
    endResize,
    renameRoom,
    deleteRoom,
  };
};

