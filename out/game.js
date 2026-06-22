"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
let tileIdCounter = 0;
class Game {
    constructor() {
        this.board = this.emptyBoard();
        this.tileIds = this.emptyBoard();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
    }
    emptyBoard() {
        return Array.from({ length: 5 }, () => Array(5).fill(0));
    }
    reset() {
        this.board = this.emptyBoard();
        this.tileIds = this.emptyBoard();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
    }
    emptyCells() {
        const cells = [];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.board[r][c] === 0) {
                    cells.push({ row: r, col: c });
                }
            }
        }
        return cells;
    }
    addRandomTile() {
        const empty = this.emptyCells();
        if (empty.length === 0) {
            return;
        }
        const { row, col } = empty[Math.floor(Math.random() * empty.length)];
        // 75% gera 2, 25% gera 4 — encher o tabuleiro mais rápido aumenta a dificuldade.
        this.board[row][col] = Math.random() < 0.15 ? 4 : 2;
        this.tileIds[row][col] = ++tileIdCounter;
    }
    slideRow(row) {
        const nonZero = row.filter(v => v !== 0);
        const result = [];
        let score = 0;
        let changed = false;
        let i = 0;
        while (i < nonZero.length) {
            if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
                const merged = nonZero[i] * 2;
                result.push(merged);
                score += merged;
                i += 2;
                changed = true;
            }
            else {
                result.push(nonZero[i]);
                i++;
            }
        }
        while (result.length < 5) {
            result.push(0);
        }
        if (!changed) {
            for (let j = 0; j < 5; j++) {
                if (result[j] !== row[j]) {
                    changed = true;
                    break;
                }
            }
        }
        return { result, score, changed };
    }
    move(direction) {
        let changed = false;
        let totalScore = 0;
        const rotateBoard = (b) => b[0].map((_, colIndex) => b.map(row => row[colIndex]).reverse());
        let workBoard = this.board.map(r => [...r]);
        if (direction === 'up') {
            workBoard = rotateBoard(workBoard);
            workBoard = rotateBoard(workBoard);
            workBoard = rotateBoard(workBoard);
        }
        else if (direction === 'down') {
            workBoard = rotateBoard(workBoard);
        }
        else if (direction === 'right') {
            workBoard = workBoard.map(r => [...r].reverse());
        }
        const newBoard = [];
        for (let r = 0; r < 5; r++) {
            const { result, score, changed: rowChanged } = this.slideRow(workBoard[r]);
            newBoard.push(result);
            totalScore += score;
            if (rowChanged) {
                changed = true;
            }
        }
        if (direction === 'up') {
            let b = newBoard;
            b = rotateBoard(b);
            this.board = b;
        }
        else if (direction === 'down') {
            let b = newBoard;
            b = rotateBoard(b);
            b = rotateBoard(b);
            b = rotateBoard(b);
            this.board = b;
        }
        else if (direction === 'right') {
            this.board = newBoard.map(r => [...r].reverse());
        }
        else {
            this.board = newBoard;
        }
        if (changed) {
            this.score += totalScore;
            this.addRandomTile();
            this.checkWin();
            this.checkGameOver();
        }
        return changed;
    }
    checkWin() {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.board[r][c] >= 4096) {
                    this.won = true;
                }
            }
        }
    }
    checkGameOver() {
        if (this.emptyCells().length > 0) {
            return;
        }
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const v = this.board[r][c];
                if (c + 1 < 5 && this.board[r][c + 1] === v) {
                    return;
                }
                if (r + 1 < 5 && this.board[r + 1][c] === v) {
                    return;
                }
            }
        }
        this.gameOver = true;
    }
    getState() {
        return {
            board: this.board.map(r => [...r]),
            score: this.score,
            gameOver: this.gameOver,
            won: this.won,
        };
    }
}
exports.Game = Game;
