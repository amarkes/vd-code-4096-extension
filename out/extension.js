"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const gamePanel_1 = require("./gamePanel");
function activate(context) {
    // Register command (guard against double-activation when installed + loaded from workspace)
    let openCommand;
    try {
        openCommand = vscode.commands.registerCommand('game4096.open', () => {
            gamePanel_1.GamePanel.createOrShow(context);
        });
        context.subscriptions.push(openCommand);
    }
    catch {
        // Command already registered by another instance of this extension; skip.
        return;
    }
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    statusBarItem.name = 'game4096.statusBar';
    statusBarItem.text = '$(play) 4096';
    statusBarItem.tooltip = 'Abrir o jogo 4096';
    statusBarItem.command = 'game4096.open';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
function deactivate() {
    // Nothing to clean up; VSCode disposes context subscriptions automatically.
}
