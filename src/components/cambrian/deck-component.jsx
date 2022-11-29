import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onDeleteCard,
      onAddCard,
      onSaveDeck,
      deck
    } = props;

    const cards = deck.cards?.map((card)=> (
      <tr key={card.id}>
        <td>{card.name}</td>
        <td>{card.size}</td>
        <td>{card.height}</td>
        <td>{card.strength}</td>
        <td>{card.image}</td>
        <td><button onClick={onDeleteCard} value={card.name} className="btn btn-red">Delete</button></td>
      </tr>
      )
    );

    return (
      <div className="container px-4 mx-auto my-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="h3">Card List</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Size</th>
                <th scope="col">Height</th>
                <th scope="col">Stregth</th>
                <th scope="col">Image</th>
                <th scope="col">Delete</th>
               </tr>
            </thead>
            <tbody>
              {cards}
            </tbody>
          </table>
          <button onClick={onAddCard} className="btn btn-white">New Card</button>
        </div>
        <button onClick={onSaveDeck} className="btn btn-white">Save deck</button>
      </div>
    );
}

DeckComponent.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    onDeleteCard: PropTypes.func,
    onAddCard: PropTypes.func,
    onSaveDeck: PropTypes.func,
};

export default DeckComponent;