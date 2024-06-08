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
  const [xLosses, setXLosses] = useState<number>(0);
  const [oLosses, setOLosses] = useState<number>(0);
  const [xDraws, setXDraws] = useState<number>(0);
  const [oDraws, setODraws] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3);
  const [numGoes, setNumGoes] = useState<number>(0);
  const [serverError, setServerError] = useState<string>("");

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
  };

  const handleWin = async (player: XorO) => {
    setWinner(player);
    try {
      await Promise.all([
        updatePlayerScore({ player, win: true }),
        updatePlayerScore({ player: player === "X" ? "O" : "X", loss: true }),
      ]).then(() => updatePlayerData());
    } catch (error) {
      setServerError(error.message);
    }
  };

  const startNewGame = () => {
    setUpBoard(gridSize);
    setWinner(undefined);
    setNumGoes(0);
  };

  const checkWin = (): boolean => {
    //assume number of rows and columns are equal
    const numRows = board.length;
    // Check row wins
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      if (board[rowIndex].every((value) => value === "X")) {
        handleWin("X");
        return true;
      } else if (board[rowIndex].every((value) => value === "O")) {
        handleWin("O");
        return true;
      }
    }
    // Check column wins
    for (let columnIndex = 0; columnIndex < numRows; columnIndex++) {
      if (board.every((row) => row[columnIndex] === "X")) {
        handleWin("X");
        return true;
      } else if (board.every((row) => row[columnIndex] === "O")) {
        handleWin("O");
        return true;
      }
    }
    // Check first-to-last diagonal wins
    if (board.every((row, index) => row[index] === "X")) {
      handleWin("X");
      return true;
    } else if (board.every((row, index) => row[index] === "O")) {
      handleWin("O");
      return true;
    }

    // Check last-to-first diagonal wins
    if (board.every((row, index) => row[numRows - 1 - index] === "X")) {
      handleWin("X");
      return true;
    } else if (board.every((row, index) => row[numRows - 1 - index] === "O")) {
      handleWin("O");
      return true;
    }
    return false;
  };

  const updateDrawData = async () => {
    setWinner("Draw");
    try {
      await Promise.all([
        updatePlayerScore({ player: "O", draw: true }),
        updatePlayerScore({ player: "X", draw: true }),
      ]).then(() => updatePlayerData());
    } catch (error) {
      setServerError(error.message);
    }
  };

  useEffect(() => {
    // should only check for a win when enough moves have been made
    const minGoes = 2 * gridSize - 1;
    if (numGoes >= minGoes) {
      const hasWinner = checkWin();
      if (hasWinner) {
        return;
      }
      // should only check for a draw when all moves have been made
      else if (numGoes === gridSize * gridSize) {
        updateDrawData();
      }
    }
  }, [board, numGoes]);

  const updateXData = async () => {
    await getPlayerData("X").then((data) => {
      setXWins(data.wins);
      setXLosses(data.losses);
      setXDraws(data.draws);
    });
  };

  const updateOData = async () => {
    await getPlayerData("O").then((data) => {
      setOWins(data.wins);
      setOLosses(data.losses);
      setODraws(data.draws);
    });
  };

  const updatePlayerData = async () => {
    try {
      await Promise.all([updateXData(), updateOData()]);
    } catch (error) {
      setServerError(error.message);
    }
  };

  // Get player data on load
  useEffect(() => {
    updatePlayerData();
  }, []);

  return (
    <div className="flex flex-col mt-10 items-center gap-10">
      <div className="font-bold text-2xl">Tic Tac Toe</div>
      <div className="flex flex-row justify-between gap-20">
        <div>
          <div>X Stats</div>
          <div>Wins: {xWins}</div>
          <div>Losses: {xLosses}</div>
          <div>Draws: {xDraws}</div>
        </div>
        <div className="flex flex-col gap-1">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((column, columnIndex) => (
                <button
                  key={columnIndex}
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
        <div>
          <div>O Stats</div>
          <div>Wins: {oWins}</div>
          <div>Losses: {oLosses}</div>
          <div>Draws: {oDraws}</div>
        </div>
      </div>
      {serverError !== "" && (
        <div className="text-rose-800 font-bold">
          {serverError}, please try again later
        </div>
      )}
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
