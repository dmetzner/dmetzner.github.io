// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Terminal from "./Terminal";

afterEach(cleanup);

const props = (over = {}) => ({
  lang: "en" as const,
  setLang: vi.fn(),
  themePref: "system" as const,
  setTheme: vi.fn(),
  root: false,
  setRoot: vi.fn(),
  onResetEdits: vi.fn(),
  ...over,
});

function run(cmd: string) {
  const input = screen.getByLabelText("terminal input");
  fireEvent.change(input, { target: { value: cmd } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("Terminal command dispatch", () => {
  it("echo prints its args verbatim", () => {
    render(<Terminal {...props()} />);
    run("echo hello world");
    expect(screen.getByText("hello world")).toBeTruthy();
  });

  it("reports unknown commands", () => {
    render(<Terminal {...props()} />);
    run("notacommand");
    expect(screen.getByText(/command not found: notacommand/i)).toBeTruthy();
  });

  it("help lists commands", () => {
    render(<Terminal {...props()} />);
    run("help");
    expect(screen.getByText(/your session/i)).toBeTruthy();
  });

  it("`theme dark` calls setTheme with the requested mode", () => {
    const p = props();
    render(<Terminal {...p} />);
    run("theme dark");
    expect(p.setTheme).toHaveBeenCalledWith("dark");
  });

  it("`lang de` switches language", () => {
    const p = props();
    render(<Terminal {...p} />);
    run("lang de");
    expect(p.setLang).toHaveBeenCalledWith("de");
  });

  it("`sudo su` enters root", () => {
    const p = props();
    render(<Terminal {...p} />);
    run("sudo su");
    expect(p.setRoot).toHaveBeenCalledWith(true);
  });

  it("plain `sudo` does NOT enter root (sudoers gag)", () => {
    const p = props();
    render(<Terminal {...p} />);
    run("sudo rm");
    expect(p.setRoot).not.toHaveBeenCalled();
    expect(screen.getByText(/not in the sudoers file/i)).toBeTruthy();
  });

  it("`exit` while root drops back to guest", () => {
    const p = props({ root: true });
    render(<Terminal {...p} />);
    run("exit");
    expect(p.setRoot).toHaveBeenCalledWith(false);
  });
});
