import type { WebviewApi } from "vscode-webview";

declare function acquireVsCodeApi<T = unknown>(): WebviewApi<T>;

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  postMessage(message: unknown) {
    this.vsCodeApi?.postMessage(message);
  }

  getState(): unknown {
    return this.vsCodeApi?.getState();
  }

  setState<T extends unknown = unknown>(newState: T): T {
    return this.vsCodeApi?.setState(newState) as T;
  }
}

export const vscode = new VSCodeAPIWrapper();
