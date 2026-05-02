import { describe, expect, it } from "vitest";
import {
  canAssignRole,
  canManageBooking,
  canManageUser,
  getHighestRole,
  hasAnyRole,
  hasRole,
  isProjectAdmin,
  isRegularUser,
  isWorkspaceAdmin,
} from "./roles";

const wsAdmin = {
  email: "ws@test.dev",
  locationId: 1,
  roles: ["ROLE_ADMIN_WORKSPACE"] as const,
};

const projAdmin = {
  email: "pa@test.dev",
  locationId: 5,
  roles: ["ROLE_ADMIN_PROJECT"] as const,
};

const user = {
  email: "u@test.dev",
  locationId: 5,
  roles: ["ROLE_USER"] as const,
};

describe("hasRole / hasAnyRole", () => {
  it("returns false for null user", () => {
    expect(hasRole(null, "ROLE_USER")).toBe(false);
    expect(hasAnyRole(null, ["ROLE_USER"])).toBe(false);
  });

  it("detects single role", () => {
    expect(hasRole(user, "ROLE_USER")).toBe(true);
    expect(hasRole(user, "ROLE_ADMIN_WORKSPACE")).toBe(false);
  });

  it("hasAnyRole matches any", () => {
    expect(hasAnyRole(projAdmin, ["ROLE_USER", "ROLE_ADMIN_PROJECT"])).toBe(true);
    expect(hasAnyRole(user, ["ROLE_ADMIN_WORKSPACE", "ROLE_ADMIN_PROJECT"])).toBe(false);
  });
});

describe("isWorkspaceAdmin / isProjectAdmin / isRegularUser", () => {
  it("classifies workspace admin", () => {
    expect(isWorkspaceAdmin(wsAdmin)).toBe(true);
    expect(isProjectAdmin(wsAdmin)).toBe(false);
    expect(isRegularUser(wsAdmin)).toBe(false);
  });

  it("classifies project admin", () => {
    expect(isWorkspaceAdmin(projAdmin)).toBe(false);
    expect(isProjectAdmin(projAdmin)).toBe(true);
  });

  it("classifies regular user", () => {
    expect(isRegularUser(user)).toBe(true);
    expect(isWorkspaceAdmin(user)).toBe(false);
  });
});

describe("canManageUser", () => {
  it("denies when user is null", () => {
    expect(canManageUser(null, { locationId: 1 })).toBe(false);
  });

  it("allows workspace admin for any location", () => {
    expect(canManageUser(wsAdmin, { locationId: 99 })).toBe(true);
  });

  it("allows project admin only for own office", () => {
    expect(canManageUser(projAdmin, { locationId: 5 })).toBe(true);
    expect(canManageUser(projAdmin, { locationId: 6 })).toBe(false);
  });

  it("denies regular user", () => {
    expect(canManageUser(user, { locationId: 5 })).toBe(false);
  });
});

describe("canAssignRole", () => {
  it("workspace admin can assign any role", () => {
    expect(canAssignRole(wsAdmin, "ROLE_USER")).toBe(true);
    expect(canAssignRole(wsAdmin, "ROLE_ADMIN_WORKSPACE")).toBe(true);
  });

  it("project admin can assign user and project admin only", () => {
    expect(canAssignRole(projAdmin, "ROLE_USER")).toBe(true);
    expect(canAssignRole(projAdmin, "ROLE_ADMIN_PROJECT")).toBe(true);
    expect(canAssignRole(projAdmin, "ROLE_ADMIN_WORKSPACE")).toBe(false);
  });

  it("regular user cannot assign", () => {
    expect(canAssignRole(user, "ROLE_USER")).toBe(false);
  });
});

describe("canManageBooking", () => {
  it("denies null user", () => {
    expect(
      canManageBooking(null, { scope: "own", ownerEmail: "u@test.dev" })
    ).toBe(false);
  });

  it("own scope: owner or admins", () => {
    expect(
      canManageBooking(user, { scope: "own", ownerEmail: "u@test.dev" })
    ).toBe(true);
    expect(
      canManageBooking(user, { scope: "own", ownerEmail: "other@test.dev" })
    ).toBe(false);
    expect(
      canManageBooking(projAdmin, { scope: "own", ownerEmail: "other@test.dev" })
    ).toBe(true);
  });

  it("office scope: workspace or matching project admin", () => {
    expect(
      canManageBooking(wsAdmin, { scope: "office", officeLocationId: 1 })
    ).toBe(true);
    expect(
      canManageBooking(projAdmin, { scope: "office", officeLocationId: 5 })
    ).toBe(true);
    expect(
      canManageBooking(projAdmin, { scope: "office", officeLocationId: 6 })
    ).toBe(false);
    expect(
      canManageBooking(user, { scope: "office", officeLocationId: 5 })
    ).toBe(false);
  });

  it("organization scope: workspace admin only", () => {
    expect(canManageBooking(wsAdmin, { scope: "organization" })).toBe(true);
    expect(canManageBooking(projAdmin, { scope: "organization" })).toBe(false);
  });
});

describe("getHighestRole", () => {
  it("returns null for empty", () => {
    expect(getHighestRole(undefined)).toBeNull();
    expect(getHighestRole([])).toBeNull();
  });

  it("picks highest by priority", () => {
    expect(
      getHighestRole(["ROLE_USER", "ROLE_ADMIN_WORKSPACE", "ROLE_ADMIN_PROJECT"])
    ).toBe("ROLE_ADMIN_PROJECT");
    expect(getHighestRole(["ROLE_USER", "ROLE_ADMIN_WORKSPACE"])).toBe(
      "ROLE_ADMIN_WORKSPACE"
    );
  });
});
