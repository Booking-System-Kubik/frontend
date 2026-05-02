import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BoundaryPolygon } from "./BoundaryPolygon";

describe("BoundaryPolygon", () => {
  it("renders polyline when open path has points", () => {
    const { container } = render(
      <svg>
        <BoundaryPolygon boundaryPoints={[[0, 0], [10, 10]]} boundaryClosed={false} zoom={1} />
      </svg>
    );
    expect(container.querySelector("polyline")).toBeInTheDocument();
    expect(container.querySelector("polygon")).not.toBeInTheDocument();
  });

  it("renders polygon when closed with >= 3 points", () => {
    const { container } = render(
      <svg>
        <BoundaryPolygon
          boundaryPoints={[
            [0, 0],
            [10, 0],
            [5, 10],
          ]}
          boundaryClosed
          zoom={2}
        />
      </svg>
    );
    expect(container.querySelector("polygon")).toBeInTheDocument();
    expect(container.querySelector("polyline")).not.toBeInTheDocument();
  });

  it("renders nothing when no points", () => {
    const { container } = render(
      <svg>
        <BoundaryPolygon boundaryPoints={[]} boundaryClosed={false} zoom={1} />
      </svg>
    );
    expect(container.querySelector("polyline")).not.toBeInTheDocument();
  });

  it("does not close polygon with fewer than 3 points", () => {
    const { container } = render(
      <svg>
        <BoundaryPolygon boundaryPoints={[[0, 0], [1, 1]]} boundaryClosed zoom={1} />
      </svg>
    );
    expect(container.querySelector("polygon")).not.toBeInTheDocument();
  });
});
