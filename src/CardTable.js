import { React, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CardTable.css";
import Card from "./Card";

const BASE_URL = "http://deckofcardsapi.com/api/deck";
const EMPTY_DECK_ERROR =
  "No cards remaining. Click 'Shuffle Deck' to draw again";

const CardTable = () => {
  const [deck, setDeck] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  // Get a new deck
  useEffect(() => {
    async function getDeck() {
      let res = await axios.get(`${BASE_URL}/new/shuffle/`);
      setDeck(res.data);
    }
    getDeck();
  }, [setDeck]);

  //Draw a Card, and add it to drawnCards
  useEffect(() => {
    async function getNewCard() {
      const { deck_id } = deck;
      try {
        let res = await axios.get(`${BASE_URL}/${deck_id}/draw/`);
        if (res.data.error) {
          setAutoDraw(false);
          throw new Error(EMPTY_DECK_ERROR);
        }
        const card = res.data.cards[0];

        card.angle = Math.random() * 90 - 45;
        card.randomX = Math.random() * 40 - 20;
        card.randomY = Math.random() * 40 - 20;

        // spread the existing cards, add this card
        setDrawnCards((cardsInDeck) => [
          ...cardsInDeck,
          {
            id: card.code,
            value: card.value,
            suit: card.suit,
            image: card.image,
            style: {
              angle: card.angle,
              randomX: card.randomX,
              randomY: card.randomY,
            },
          },
        ]);
      } catch (err) {
        if (err.message === EMPTY_DECK_ERROR) {
          alert(err.message);
        } else {
          console.error(err);
        }
      }
    }

    // if autodraw is on but we dont have a timer
    // set one
    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getNewCard();
      }, 1000);
    }

    // clear this timer so we only have 1
    // active timer at any time
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw((auto) => !auto);
  };

	// shuffle the current deck and 
	// empty drawnCards
  const shuffleDeck = async () => {
    const { deck_id } = deck;
    try {
      await axios.get(`${BASE_URL}/${deck_id}/shuffle/`);
      setDrawnCards([]);
    } catch (err) {
      alert(err);
    }
  };

  const cardDeck = drawnCards.map((c) => (
    <Card
      key={c.id}
      value={c.value}
      suit={c.suit}
      image={c.image}
      style={c.style}
    />
  ));

  return (
    <div>
      <button className="btn btn-warning" onClick={shuffleDeck}>
        Shuffle Deck
      </button>
      {cardDeck ? (
        <button
          className={!autoDraw ? "btn btn-primary" : "btn btn-danger"}
          onClick={toggleAutoDraw}
        >
          {autoDraw ? "STOP" : "START"} drawing cards
        </button>
      ) : null}
      <div className="card-container">{cardDeck}</div>
    </div>
  );
};
export default CardTable;
