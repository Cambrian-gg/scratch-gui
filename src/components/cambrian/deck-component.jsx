import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onCreateCard,
      onChangeCard,
      onDeleteCard,
      onCreateDeck,
      onUpdateDeck,
      onChangeDeck,
      deck
    } = props;

    if(deck) {
      const cards = deck.cards?.map((card)=> (
        <tr key={card.id} id={"card-"+card.id}>
          <td><input onChange={onChangeCard} value={card.name}></input></td>
          <td><input value={card.size}></input></td>
          <td><input value={card.height}></input></td>
          <td><input value={card.strength}></input></td>
          <td><input value={card.image}></input></td>
          <td><button onClick={onDeleteCard} value={card.id} className="btn btn-red">Delete</button></td>
        </tr>
        )
      );

      return (
        <div className="container px-4 mx-auto my-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="h1"><span>Deck name</span><input onChange={onChangeDeck} value={deck.name}></input></h1>
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
    onCreateCard: PropTypes.func,
    onChangeCard: PropTypes.func,
    onDeleteCard: PropTypes.func,
    onCreateDeck: PropTypes.func,
    onUpdateDeck: PropTypes.func,
    onChangeDeck: PropTypes.func,
};

export default DeckComponent;