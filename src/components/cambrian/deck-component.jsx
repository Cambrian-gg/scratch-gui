import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onCreateCard,
      onChangeCard,
      onDeleteCard,
      onChangeCategory,
      OnChangeCategoryValue,
      onCreateDeck,
      onUpdateDeck,
      onChangeDeck,
      onCreateCardAiGeneration,
      onGenerateImagesChanged,
      isGenerateImagesSelected,
      onCreateCostumeFromCard,
      deck
    } = props;

    if(deck) {

      const categories = deck.categories?.map(({id, name}) => (
          <th key={id} scope="col"><input id={"category-"+ id} onChange={onChangeCategory} value={name}></input></th>
        )
      );

      // TODO mkirilov this should not be here it does not follow the pattern.
      const categoryIds = deck.categories?.map(({ id }) => id);

      const cards = deck.cards?.map((card)=> (
        <tr key={card.id} id={"card-"+card.id}>
          <td><input onChange={onChangeCard} value={card.name}></input></td>

          {
            categoryIds.map((categoryId) => {
              const categoryValue = card?.categoryValues?.filter((categoryValue) => categoryValue.cardId == card.id && categoryValue.categoryId == categoryId)[0];
              return <td key={`${categoryId}-${card.id}`}>
                    <input value={categoryValue?.value || ""}
                      id={`categoryValue-${categoryValue?.id}`}
                      data-category-id={categoryId}
                      data-card-id={card.id}
                      onChange={OnChangeCategoryValue}></input>
                   </td>;
            })
          }
          <td><img src={card.imageUrl}></img></td>
          <td><button onClick={onCreateCardAiGeneration} value={card.id} className="btn btn-red">Autocomplete</button></td>
          <td><button onClick={onCreateCostumeFromCard} value={card.id} className="btn btn-red">Create costume</button></td>
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
            <p>Should generate images</p>
            <input
              type="checkbox"
              name="Generate Images"
              checked={isGenerateImagesSelected}
              onChange={onGenerateImagesChanged}
              className="form-check-input"
            />

            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  {categories}
                  <th scope="col">Image</th>
                  <th scope="col">Costume</th>
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
    onChangeCategory: PropTypes.func,
    OnChangeCategoryValue: PropTypes.func,
    onCreateDeck: PropTypes.func,
    onUpdateDeck: PropTypes.func,
    onChangeDeck: PropTypes.func,
    onCreateCardAiGeneration: PropTypes.func,
    isGenerateImagesSelected: PropTypes.bool,
    onGenerateImagesChanged: PropTypes.func,
    onCreateCostumeFromCard: PropTypes.func
};

export default DeckComponent;