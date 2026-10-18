import { describe, expect, it } from "vitest";
import { formatBytes, getInitials, isSafeRedirect, pluralize, byteLength } from "@/lib/utils";

describe("formatBytes", () => {
  it("formats common sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(50 * 1024 * 1024)).toBe("50 MB");
  });
});

describe("isSafeRedirect", () => {
  it("accepts same-origin paths only", () => {
    expect(isSafeRedirect("/dashboard")).toBe(true);
    expect(isSafeRedirect("/uploads?status=failed")).toBe(true);
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("/\\evil.com")).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
  });
});

describe("helpers", () => {
  it("builds initials", () => {
    expect(getInitials("Asha Verma")).toBe("AV");
    expect(getInitials("  madonna ")).toBe("M");
    expect(getInitials(null)).toBe("?");
  });

  it("pluralizes", () => {
    expect(pluralize(1, "channel")).toBe("1 channel");
    expect(pluralize(3, "channel")).toBe("3 channels");
  });

  it("counts bytes, not characters", () => {
    expect(byteLength("abc")).toBe(3);
    expect(byteLength("नमस्ते")).toBeGreaterThan(6);
  });
});
