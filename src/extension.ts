import * as vscode from 'vscode';
import { GamePanel } from './gamePanel';

export function activate(context: vscode.ExtensionContext): void {
  // Register command (guard against double-activation when installed + loaded from workspace)
  let openCommand: vscode.Disposable;
  try {
    openCommand = vscode.commands.registerCommand('game4096.open', () => {
      GamePanel.createOrShow(context);
    });
    context.subscriptions.push(openCommand);
  } catch {
    // Command already registered by another instance of this extension; skip.
    return;
  }

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  statusBarItem.name = 'game4096.statusBar';
  statusBarItem.text = '$(play) 4096';
  statusBarItem.tooltip = 'Abrir o jogo 4096';
  statusBarItem.command = 'game4096.open';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);
}

export function deactivate(): void {
  // Nothing to clean up; VSCode disposes context subscriptions automatically.
}
