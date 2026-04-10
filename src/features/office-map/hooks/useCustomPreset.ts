import { useState, useRef } from "react";
import type { Preset } from "../model/types";
import { genId, snapPointToGrid } from "../lib/helpers";

export const useCustomPreset = (setPresets: React.Dispatch<React.SetStateAction<Preset[]>>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPolyPoints, setModalPolyPoints] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const modalSvgRef = useRef<SVGSVGElement | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalPolyPoints([]);
    setIsDrawing(false);
    setLastPoint(null);
  };

  const getSnappedPoint = (e: React.MouseEvent) => {
    const svg = modalSvgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const snapped = snapPointToGrid(rawX, rawY);
    return snapped;
  };

  const handleModalMouseDown = (e: React.MouseEvent) => {
    const snapped = getSnappedPoint(e);
    if (!snapped) return;
    setIsDrawing(true);
    setLastPoint(snapped);
    setModalPolyPoints((p) => [...p, [snapped.x, snapped.y]]);
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const snapped = getSnappedPoint(e);
    if (!snapped) return;

    // Добавляем точку только если курсор ощутимо сместился, чтобы не плодить лишние точки
    if (!lastPoint || Math.hypot(snapped.x - lastPoint.x, snapped.y - lastPoint.y) >= 8) {
      setModalPolyPoints((p) => [...p, [snapped.x, snapped.y]]);
      setLastPoint(snapped);
    }
  };

  const handleModalMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearModalPoints = () => {
    setModalPolyPoints([]);
    setIsDrawing(false);
    setLastPoint(null);
  };

  const addPreset = () => {
    if (modalPolyPoints.length < 3) {
      alert("Нарисуйте фигуру с минимум 3 точками.");
      return;
    }
    const id = genId("p_");
    setPresets((p) => [
      ...p,
      { id, name: `Кастом ${p.length + 1}`, type: "poly", poly: modalPolyPoints },
    ]);
    setModalPolyPoints([]);
    setIsModalOpen(false);
    setIsDrawing(false);
    setLastPoint(null);
  };

  return {
    isModalOpen,
    modalPolyPoints,
    modalSvgRef,
    openModal,
    closeModal,
    handleModalMouseDown,
    handleModalMouseMove,
    handleModalMouseUp,
    clearModalPoints,
    addPreset,
  };
};

