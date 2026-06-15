import * as vscode from 'vscode';
import * as crypto from 'crypto';

function getNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

export class GamePanel {
  public static currentPanel: GamePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static readonly viewType = 'game4096';

  public static createOrShow(context: vscode.ExtensionContext): void {
    const column = vscode.ViewColumn.One;

    if (GamePanel.currentPanel) {
      GamePanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      GamePanel.viewType,
      '4096 Game',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'out', 'webview')],
      }
    );

    GamePanel.currentPanel = new GamePanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (message: { command: string; score?: number; wins?: number; losses?: number }) => {
        switch (message.command) {
          case 'saveScore':
            if (typeof message.score === 'number') {
              const best = this._context.globalState.get<number>('bestScore', 0);
              if (message.score > best) {
                this._context.globalState.update('bestScore', message.score);
              }
            }
            break;
          case 'getBestScore': {
            const best = this._context.globalState.get<number>('bestScore', 0);
            this._panel.webview.postMessage({ command: 'bestScore', score: best });
            break;
          }
          case 'getStats': {
            const wins = this._context.globalState.get<number>('wins', 0);
            const losses = this._context.globalState.get<number>('losses', 0);
            this._panel.webview.postMessage({ command: 'stats', wins, losses });
            break;
          }
          case 'saveWins':
            if (typeof message.wins === 'number') {
              this._context.globalState.update('wins', message.wins);
            }
            break;
          case 'saveLosses':
            if (typeof message.losses === 'number') {
              this._context.globalState.update('losses', message.losses);
            }
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private _update(): void {
    this._panel.webview.html = this._getHtmlContent();
  }

  private _getHtmlContent(): string {
    const webview = this._panel.webview;
    const nonce = getNonce();

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'out', 'webview', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'out', 'webview', 'assets', 'index.css')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>4096</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  public dispose(): void {
    GamePanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) { d.dispose(); }
    }
  }
}
