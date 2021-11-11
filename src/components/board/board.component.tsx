import React, { useEffect, useState } from "react";
import "./board.styles.scss";
import "./sounds/";

const { Howl } = require("howler");

interface IProps {
  size: number;
}

let movement: NodeJS.Timeout;

interface Directions {
  [direction: string]: boolean;
}

let soundOff = new Howl({
  src: ["./sounds/sound-off.m4a"],
});

let soundOn = new Howl({
  src: ["./sounds/sound-on.m4a"],
});

let sound = new Howl({
  src: ["./sounds/eat.m4a"],
});

let keyUp = new Howl({
  src: ["./sounds/keypress-up.mp3"],
});

let keyDown = new Howl({
  src: ["./sounds/keypress-down.mp3"],
});
let start = new Howl({
  src: ["./sounds/game-start.mp3"],
});
let gameSoundtrack = new Howl({
  src: ["./sounds/game-soundtrack.m4a"],
  loop: true,
});
let lose = new Howl({
  src: ["./sounds/lose.m4a"],
});

export const Board: React.FC<IProps> = ({ size }) => {
  //
  //
  //
  //
  //
  //
  //
  //

  //

  var xDown: any = null;
  var yDown: any = null;

  function getTouches(evt: any) {
    return (
      evt.touches || // browser API
      evt.originalEvent.touches
    ); // jQuery
  }

  function handleTouchStart(evt: any) {
    if (gameOver || !gameStart) return;
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt: any) {
    if (gameOver || !gameStart) return;
    if (!xDown || !yDown) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        if (directions.left || directions.right || pause) return;
        setDirections((prev) => {
          return changeDirection(prev, "left");
        });

        stop(movement);
        stepper("left", movement);

        movement = setInterval(() => {
          stepper("left", movement);
        }, 1000 / difficulty);
      } else {
        if (directions.right || directions.left || pause) return;
        setDirections((prev) => {
          return changeDirection(prev, "right");
        });

        stop(movement);
        stepper("right", movement);

        movement = setInterval(() => {
          stepper("right", movement);
        }, 1000 / difficulty);
      }
    } else {
      if (yDiff > 0) {
        if (directions.up || directions.down || pause) return;
        setDirections((prev) => {
          return changeDirection(prev, "up");
        });

        stop(movement);
        stepper("up", movement);
        movement = setInterval(() => {
          stepper("up", movement);
        }, 1000 / difficulty);
      } else {
        // If the user presses the arrow DOWN key

        if (directions.down || directions.up || pause) return;
        setDirections((prev) => {
          return changeDirection(prev, "down");
        });

        stop(movement);
        stepper("down", movement);

        movement = setInterval(() => {
          stepper("down", movement);
        }, 1000 / difficulty);
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  const handleKeyDown = () => {
    !noSound && keyDown.play();
  };
  const handleKeyUp = () => {
    !noSound && keyUp.play();
  };

  // The bricks on the board, starting at x2, y2
  const [currrentBricks, setCurrentBrick] = useState([[1, 2]]);
  const [highscore, setHighScore] = useState<number>(
    localStorage["locale"] || 0
  );

  const [isActive, setIsActive] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [noSound, setNoSound] = useState(false);

  // Difficulty level
  const [difficulty, setDifficulty] = useState<number>(3);

  // Pause condition
  const [pause, setPause] = useState<boolean>(false);

  // Starting a new game
  const [gameStart, setGameStart] = useState<boolean>(false);

  // Show settings
  const [settings, setSettings] = useState<boolean>(false);

  // Condition of the game
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Dot position
  const [dot, setDot] = useState<[number, number]>([
    Math.trunc(Math.random() * size),
    Math.trunc(Math.random() * size),
  ]);

  const changeDifficulty = (hardness: number, diff: string) => {
    setIsActive((prev: { [active: string]: boolean }): any => {
      Object.keys(prev).map((key) => {
        return (prev[key] = false);
      });

      return { ...prev, [diff]: true };
    });
    console.log(isActive);

    setDifficulty(hardness);
  };

  // Current direction
  const [directions, setDirections] = useState<Directions>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const initializeGame = () => {
    !noSound && gameSoundtrack.play();
    setDirections({
      left: false,
      right: false,
      up: false,
      down: true,
    });
    setCurrentBrick([[1, 2]]);
    setGameOver(false);

    movement = setInterval(() => {
      stepper("down", movement);
    }, 1000 / difficulty);
  };

  const startGame = () => {
    console.log(`Hello!`);
    !noSound && start.play();
    setGameStart(true);
    initializeGame();
  };

  //   Generate a matrix board
  const generateBoard = () => {
    let board = [];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        board.push([x, y]);
      }
    }

    // Map through the board and make canvas
    return board.map((brick, i) => {
      return (
        <div
          key={i}
          className={`brick${currrentBricks
            .map((currBrick) => {
              return currBrick.join("") === brick.join("")
                ? ` current`
                : brick.join("") === dot.join("")
                ? " dot"
                : "";
            })
            .join("")}`}
        ></div>
      );
    });
  };

  // Growing the snake 1 at the time (adding to 'currentBricks')
  const snakeGrow = () => {
    !noSound && sound.play();
    setCurrentBrick((prev) => {
      return [...prev, [prev[prev.length - 1][0], prev[prev.length - 1][1]]];
    });
  };

  //   Generate a new random for the treat if current poition is the same as treat
  useEffect(() => {
    currrentBricks.map((brick) => {
      // if the dot hides inside the snake, generate a new position
      if (brick.join() === dot.join()) {
        setDot([
          Math.trunc(Math.random() * size),
          Math.trunc(Math.random() * size),
        ]);
      }
      return null;
    });

    if (currrentBricks[0].join("") === dot.join("")) {
      snakeGrow();
    }
  }, [currrentBricks, dot, size]);

  // Stop the snake from moving any further
  const stop = (interval: NodeJS.Timeout) => {
    if (!interval) return;
    clearInterval(interval);
  };

  useEffect(() => {
    if (gameOver) {
      localStorage.setItem("locale", String(highscore));
      if (currrentBricks.length - 1 >= Number(highscore)) {
        setHighScore(currrentBricks.length - 1);
      }
      !noSound && lose.play();
      gameSoundtrack.pause();
      clearInterval(movement);
      return;
    }
  }, [gameOver, noSound, currrentBricks.length, highscore]);

  // Change the direction of the snake
  var changeDirection = (obj: Directions, dir: string) => {
    Object.keys(obj).map((key) => {
      return (obj[key] = false);
    });

    return { ...obj, [dir]: true };
  };

  // Control of which direction the snake should 'step'
  const stepper = (direction: string, interval: NodeJS.Timeout) => {
    setCurrentBrick((prev): any => {
      if (
        (direction === "up" && prev[0][0] <= 0) ||
        (direction === "down" && prev[0][0] >= size - 1) ||
        (direction === "left" && prev[0][1] <= 0) ||
        (direction === "right" && prev[0][1] >= size - 1)
      ) {
        clearInterval(interval);
        setGameOver(true);
      }

      return prev.map((arrItem, i) => {
        if (i === 0) {
          if (direction === "up") {
            return [arrItem[0] - 1, arrItem[1]];
          } else if (direction === "down") {
            return [arrItem[0] + 1, arrItem[1]];
          } else if (direction === "left") {
            return [arrItem[0], arrItem[1] - 1];
          } else if (direction === "right") {
            return [arrItem[0], arrItem[1] + 1];
          }
        } else {
          return prev[i - 1];
        }
        return null;
      });
    });
  };

  useEffect(() => {
    currrentBricks.map((brick, i) => {
      if (i < 2) return null;
      if (brick.join("") === currrentBricks[0].join("")) {
        setGameOver(true);
      }
      return null;
    });
  }, [currrentBricks]);

  //   User controller
  const handleKeyPress = (e: any) => {
    if (gameOver || !gameStart) return;

    if (e.keyCode === 38) {
      // If the user presses the arrow UP key
      if (directions.up || directions.down || pause) return;
      setDirections((prev) => {
        return changeDirection(prev, "up");
      });

      stop(movement);
      stepper("up", movement);
      movement = setInterval(() => {
        stepper("up", movement);
      }, 1000 / difficulty);
    } else if (e.keyCode === 40) {
      // If the user presses the arrow DOWN key

      if (directions.down || directions.up || pause) return;
      setDirections((prev) => {
        return changeDirection(prev, "down");
      });

      stop(movement);
      stepper("down", movement);

      movement = setInterval(() => {
        stepper("down", movement);
      }, 1000 / difficulty);
    } else if (e.keyCode === 37) {
      // If the user presses the arrow LEFT key

      if (directions.left || directions.right || pause) return;
      setDirections((prev) => {
        return changeDirection(prev, "left");
      });

      stop(movement);
      stepper("left", movement);

      movement = setInterval(() => {
        stepper("left", movement);
      }, 1000 / difficulty);
    } else if (e.keyCode === 39) {
      // If the user presses the arrow RIGHT key

      if (directions.right || directions.left || pause) return;
      setDirections((prev) => {
        return changeDirection(prev, "right");
      });

      stop(movement);
      stepper("right", movement);

      movement = setInterval(() => {
        stepper("right", movement);
      }, 1000 / difficulty);
    } else if (e.keyCode === 32) {
      setPause((prev: boolean) => !prev);
      gameSoundtrack.pause();
      clearInterval(movement);

      if (pause) {
        setSettings(false);
        !noSound && gameSoundtrack.play();
        let directionBeforePause = Object.keys(directions).filter((key) => {
          if (directions[key] === true) {
            return key;
          }
          return null;
        });

        stepper(String(directionBeforePause), movement);
        movement = setInterval(() => {
          stepper(String(directionBeforePause), movement);
        }, 1000 / difficulty);
      }
    }
  };

  // Add the event-listeners to the dom
  useEffect(() => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // some code..
      document.addEventListener("touchstart", handleTouchStart, false);
      document.addEventListener("touchmove", handleTouchMove, false);
    } else {
      document.addEventListener("keydown", handleKeyPress);
      document.addEventListener("touchstart", handleKeyPress);
    }
    return () => {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        // some code..
        document.removeEventListener("touchstart", handleTouchStart, false);
        document.removeEventListener("touchmove", handleTouchMove, false);
      } else {
        document.removeEventListener("keydown", handleKeyPress);
        document.removeEventListener("touchstart", handleKeyPress);
      }
    };
  });

  return (
    <>
      <h3 className="score-corner">
        Score: {currrentBricks.length - 1}
        <br />
        Highscore: {highscore}
      </h3>
      <div className="board-container">
        {!gameStart && !settings && (
          <div className="start-game">
            <h1>Snake</h1>
            <div className="difficulty">
              <button
                className={isActive.easy ? "active" : ""}
                onMouseDown={handleKeyDown}
                onMouseUp={handleKeyUp}
                onClick={() => changeDifficulty(3, "easy")}
              >
                Easy
              </button>
              <button
                className={isActive.medium ? "active" : ""}
                onMouseDown={handleKeyDown}
                onMouseUp={handleKeyUp}
                onClick={() => changeDifficulty(5, "medium")}
              >
                Medium
              </button>
              <button
                className={isActive.hard ? "active" : ""}
                onMouseDown={handleKeyDown}
                onMouseUp={handleKeyUp}
                onClick={() => changeDifficulty(9, "hard")}
              >
                Hard
              </button>
            </div>

            <div
              className="settings-icon"
              onClick={() => {
                !noSound && soundOn.play();
                setSettings(true);
              }}
            >
              <img src="./icons/settings-icon.svg" alt="settings" />
            </div>
            <button
              onMouseDown={handleKeyDown}
              onMouseUp={handleKeyUp}
              className="start-game-btn"
              onClick={startGame}
            >
              Start game
            </button>
          </div>
        )}
        {settings && (
          <div className="start-game-controls">
            <button
              className="sound-control"
              onClick={() => {
                !noSound ? soundOff.play() : soundOn.play();
                setNoSound((prev) => !prev);
              }}
            >
              <img
                src={
                  !noSound ? `./icons/sound-on.svg` : `./icons/sound-off.svg`
                }
                alt="sound"
              />
            </button>
            <div
              onClick={() => {
                !noSound && soundOn.play();
                setSettings(false);
              }}
              className="go-back"
            >
              ←
            </div>
            <p>Move:</p>
            <div className="start-game-controls-container">
              <div className="start-game-controls-container_btn">↑</div>
            </div>
            <div className="start-game-controls-container">
              <div className="start-game-controls-container_btn">←</div>
              <div className="start-game-controls-container_btn">↓</div>
              <div className="start-game-controls-container_btn">→</div>
            </div>
            <p>Pause:</p>
            <div className="start-game-controls-container">
              <div
                className="start-game-controls-container_btn"
                style={{ padding: "0rem 2rem" }}
              >
                ⎵
              </div>
            </div>
          </div>
        )}
        {pause && !settings && (
          <div className="pause">
            <div
              onClick={() => {
                !noSound && soundOn.play();
                setSettings(true);
              }}
              className="settings-icon"
            >
              <img src="./icons/settings-icon.svg" alt="settings" />
            </div>
            <h1>Paused</h1>
            <h1 className="score">Score: {currrentBricks.length - 1}</h1>
          </div>
        )}
        {gameOver && (
          <div className="game-over">
            <h1 className="game-over-text">Game over!</h1>
            <button
              className="game-over-btn"
              onMouseDown={handleKeyDown}
              onMouseUp={handleKeyUp}
              onClick={initializeGame}
            >
              Play again
            </button>
          </div>
        )}
        <div className="board">{generateBoard()}</div>
        <div className="depth"></div>
      </div>
    </>
  );
};
