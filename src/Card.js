import { React } from "react";
import "./Card.css";

const Card = ({ image, value, suit, style }) => {
  return (
    <div>
      <img
        className="drawn-card"
        src={image}
        alt={`${value} of ${suit}`}
        style={{
          transform: `translate(${style.randomX}px,${style.randomY}px) rotate(${style.angle}deg)`
        }}
      ></img>
    </div>
  );
};

export default Card;
