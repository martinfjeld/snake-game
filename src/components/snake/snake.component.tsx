import React from "react";
import { Board } from "../board/board.component";
import "./snake.styles.scss";

export const Snake = () => {
  return (
    <div>
      <Board size={10} />
    </div>
  );
};
