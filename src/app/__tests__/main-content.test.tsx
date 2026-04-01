import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

// Mock context providers
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock resizable components
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

// Mock child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders Preview tab as active by default", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: "Preview" });
  const codeButton = screen.getByRole("tab", { name: "Code" });

  expect(previewButton.getAttribute("data-state")).toBe("active");
  expect(codeButton.getAttribute("data-state")).toBe("inactive");
});

test("shows PreviewFrame when Preview tab is active", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();
});

test("clicking Code tab switches to code view", () => {
  render(<MainContent />);

  const codeButton = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeButton);

  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking Code tab marks it as active", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: "Preview" });
  const codeButton = screen.getByRole("tab", { name: "Code" });

  fireEvent.click(codeButton);

  expect(codeButton.getAttribute("data-state")).toBe("active");
  expect(previewButton.getAttribute("data-state")).toBe("inactive");
});

test("clicking Preview tab after Code tab switches back to preview", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: "Preview" });
  const codeButton = screen.getByRole("tab", { name: "Code" });

  // Switch to code
  fireEvent.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  fireEvent.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Preview tab after Code marks Preview as active again", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: "Preview" });
  const codeButton = screen.getByRole("tab", { name: "Code" });

  fireEvent.click(codeButton);
  fireEvent.click(previewButton);

  expect(previewButton.getAttribute("data-state")).toBe("active");
  expect(codeButton.getAttribute("data-state")).toBe("inactive");
});
