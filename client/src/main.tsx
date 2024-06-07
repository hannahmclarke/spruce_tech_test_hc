import React, { useEffect, useState } from "react";
import { XorO } from "./types";
import { getPlayerData, updatePlayerScore } from "./serverFunctions";

export const Main = () => {
  const [board, setBoard] = useState<(XorO | undefined)[][]>([
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ]);
  const [turn, setTurn] = useState<XorO>("X");
  const [winner, setWinner] = useState<XorO | "Draw" | undefined>(undefined);
  const [xWins, setXWins] = useState<number>(0);
  const [oWins, setOWins] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3);
  const [numGoes, setNumGoes] = useState<number>(0);

  const handleGo = async (rowIndex: number, columnIndex: number) => {
    if (board[rowIndex][columnIndex] === undefined) {
      let newBoard = [...board];
      newBoard[rowIndex][columnIndex] = turn;
      setBoard(newBoard);
      setTurn(turn === "X" ? "O" : "X");
      setNumGoes(numGoes + 1);
    }
  };

  const setUpBoard = (gridSize: number) => {
    let newBoard = [] as Array<Array<XorO | undefined>>;
    for (let row = 0; row < gridSize; row++) {
      let newRow = [] as Array<XorO | undefined>;
      for (let column = 0; column < gridSize; column++) {
        newRow.push(undefined);
      }
      newBoard.push(newRow);
    }
    setBoard(newBoard);
    console.log(newBoard);
  };

  const handleXWins = async () => {
    setXWins(xWins + 1);
    setWinner("X");
    await Promise.all([
      updatePlayerScore({ player: "X", win: true }),
      updatePlayerScore({ player: "O", loss: true }),
    ]);
  };

  const handleOWins = async () => {
    setOWins(oWins + 1);
    setWinner("O");
    await Promise.all([
      updatePlayerScore({ player: "O", win: true }),
      updatePlayerScore({ player: "X", loss: true }),
    ]);
  };

  const startNewGame = () => {
    setUpBoard(gridSize);
    setWinner(undefined);
    setNumGoes(0);
  };

  const checkWin = () => {
    //assume number of rows and columns are equal
    const numRows = board.length;
    // Check row wins
    board.forEach((row) => {
      if (row.every((value) => value === "X")) {
        return handleXWins();
      } else if (row.every((value) => value === "O")) {
        return handleOWins();
      }
    });
    // Check column wins
    for (let columnIndex = 0; columnIndex < numRows; columnIndex++) {
      if (board.every((row) => row[columnIndex] === "X")) {
        return handleXWins();
      } else if (board.every((row) => row[columnIndex] === "O")) {
        return handleOWins();
      }
    }
    // Check first-to-last diagonal wins
    if (board.every((row, index) => row[index] === "X")) {
      return handleXWins();
    } else if (board.every((row, index) => row[index] === "O")) {
      return handleOWins();
    }

    // Check last-to-first diagonal wins
    if (board.every((row, index) => row[numRows - 1 - index] === "X")) {
      return handleXWins();
    } else if (board.every((row, index) => row[numRows - 1 - index] === "O")) {
      return handleOWins();
    }
  };

  const updateDrawData = async () => {
    await Promise.all([
      updatePlayerScore({ player: "O", draw: true }),
      updatePlayerScore({ player: "X", draw: true }),
    ]);
  };

  useEffect(() => {
    // should only check for a win when enough moves have been made
    const minGoes = 2 * gridSize - 1;
    if (numGoes >= minGoes) {
      checkWin();
    }
    // should only check for a draw when all moves have been made
    if (numGoes === gridSize * gridSize && winner === undefined) {
      setWinner("Draw");
      updateDrawData();
    }
  }, [board]);

  const getInitialScores = async () => {
    const xData = await getPlayerData("X");
    const oData = await getPlayerData("O");
    setXWins(xData.wins);
    setOWins(oData.wins);
  };
  useEffect(() => {
    getInitialScores();
  }, []);

  return (
    <div className="flex flex-col mt-10 items-center gap-10">
      <div className="font-bold text-2xl">Tic Tac Toe</div>
      <div className="flex flex-row justify-between gap-20">
        <div>X wins: {xWins}</div>
        <div className="flex flex-col gap-1">
          {board.map((row, rowIndex) => (
            <div className="flex gap-1">
              {row.map((column, columnIndex) => (
                <button
                  onClick={() => handleGo(rowIndex, columnIndex)}
                  disabled={winner !== undefined}
                >
                  <div className="border-2 border-gray-900 w-10 h-10 cursor-pointer items-center justify-center text-2xl font-bold flex">
                    {column}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div>O wins: {oWins}</div>
      </div>
      {winner !== undefined ? (
        <div className="flex flex-col items-center gap-3">
          <div>Game Over</div>
          {winner === "Draw" ? (
            <div>It's a draw!</div>
          ) : (
            <div>{winner} wins!</div>
          )}
          <div className="flex flex-row gap-5 items-center">
            <label htmlFor="gridSize">Grid Size:</label>
            <input
              className="border-2 border-gray-900 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
              type="number"
              id="gridSize"
              name="gridSize"
              min="3"
              max="15"
              defaultValue={3}
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
            ></input>
            <button
              className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full"
              onClick={startNewGame}
            >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <div>Turn: {turn}</div>
      )}
    </div>
  );
};
