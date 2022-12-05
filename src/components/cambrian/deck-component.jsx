import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onCreateCard,
      onDeleteCard,
      onCreateDeck,
      onUpdateDeck,
      deck
    } = props;

    if(deck) {
      const cards = deck.cards?.map((card)=> (
        <tr key={card.id}>
          <td>{card.name}</td>
          <td>{card.size}</td>
          <td>{card.height}</td>
          <td>{card.strength}</td>
          <td>{card.image}</td>
          <td><button onClick={onDeleteCard} value={card.id} className="btn btn-red">Delete</button></td>
        </tr>
        )
      );

      return (
        <div className="container px-4 mx-auto my-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="h1">{deck.name}</h1>
              <h2 className="h3">Card List</h2>
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
            <button onClick={onCreateCard} className="btn btn-white">Create Card</button>
          </div>
          <button onClick={onUpdateDeck} className="btn btn-white">Update deck</button>
        </div>
      );
    }
    else {
      return (
        <div>
          <p>There is no deck associated with this project. Please create a new one</p>
          <button onClick={onCreateDeck} className="btn btn-white">Create Deck</button>
        </div>
      )
    }
}

DeckComponent.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    onDeleteCard: PropTypes.func,
    onCreateCard: PropTypes.func,
    onCreateDeck: PropTypes.func,
    onUpdateDeck: PropTypes.func,
};

export default DeckComponent;