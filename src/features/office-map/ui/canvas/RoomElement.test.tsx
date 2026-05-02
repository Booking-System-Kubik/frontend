import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Room } from "../../model/types";
import { RoomElement } from "./RoomElement";

const rectRoom: Room = {
  id: "r1",
  name: "Office",
  x: 10,
  y: 20,
  width: 60,
  height: 40,
};

const polyRoom: Room = {
  id: "r2",
  name: "Custom",
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  shape: [
    [0, 0],
    [40, 0],
    [40, 40],
    [0, 40],
  ],
};

describe("RoomElement", () => {
  it("renders rect for standard room", () => {
    const onMouseDown = vi.fn();
    const onResizeMouseDown = vi.fn();
    const { container } = render(
      <svg>
        <RoomElement
          room={rectRoom}
          isSelected={false}
          zoom={1}
          onMouseDown={onMouseDown}
          onResizeMouseDown={onResizeMouseDown}
        />
      </svg>
    );
    expect(container.querySelector("rect")).toBeInTheDocument();
    expect(container.querySelector("polygon")).not.toBeInTheDocument();
  });

  it("renders polygon when shape is set", () => {
    const { container } = render(
      <svg>
        <RoomElement
          room={polyRoom}
          isSelected
          zoom={1}
          onMouseDown={vi.fn()}
          onResizeMouseDown={vi.fn()}
        />
      </svg>
    );
    expect(container.querySelector("polygon")).toBeInTheDocument();
  });

  it("calls onMouseDown when clicking room", async () => {
    const user = userEvent.setup();
    const onMouseDown = vi.fn();
    const { container } = render(
      <svg>
        <RoomElement
          room={rectRoom}
          isSelected={false}
          zoom={1}
          onMouseDown={onMouseDown}
          onResizeMouseDown={vi.fn()}
        />
      </svg>
    );
    const rect = container.querySelector("rect");
    await user.click(rect!);
    expect(onMouseDown).toHaveBeenCalled();
  });
});
