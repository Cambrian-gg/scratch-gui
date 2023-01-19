import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onCreateCard,
      onChangeCard,
      onUpdateCard,
      onDeleteCard,
      onChangeCategory,
      OnChangeCategoryValue,
      onCreateDeck,
      onUpdateDeck,
      onChangeDeck,
      onCreateCardAiGeneration,
      onGenerateImagesChanged,
      isGenerateImagesSelected,
      onAutocompleteAll,
      deck,
    } = props;

    if(deck) {
      const isLoading = props.isLoading || deck.cards.some( card => card.cardAiGenerations.some(cag=> cag["completedAt"] == null));

      const categories = deck.categories?.map((category) => (
          <th key={category.id} scope="col" className="px-2">
            <input
              className="block w-32 mx-auto text-center rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
              onChange={onChangeCategory}
              onBlur={onUpdateDeck}
              data-category-id={category.id}
              value={category.name}>
            </input>
          </th>
        )
      );
      // TODO mkirilov this should not be here it does not follow the pattern.
      const categoryIds = deck.categories?.map(({ id }) => id);

      const cards = deck.cards?.map((card)=> (
        <tr key={card.id} id={"card-"+ card.id}>
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
            <div className="flex items-center">
              <div className="h-20 w-20 flex-shrink-0">
                <img className="h-20 w-20 rounded-sm" src={card.imageUrl}></img>
              </div>
              <div className="ml-4">
                <input
                  className="block mx-auto w-36 pl-2 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                  onChange={onChangeCard}
                  onBlur={onUpdateCard}
                  value={card.name}
                  data-card-id={card.id}
                  >
                </input>
                { card.cardAiGenerations.some(cag => cag["completedAt"] == null) && <span>Autocompleting please wait...</span> }
                {
                  // Not the best way. I am not sure how much of information should we expose to the outside world
                  // Should we get into the details of what failed - like a key, or request or something.
                  // Should we make a distinction between "at capacity" and "an error occurred".
                  // Until more requirements come I am just exposing the message
                  card.cardAiGenerations.some(cag => cag["rawResponse"] && cag["rawResponse"]["code"] != "200") && <span>Could not get a result from AI. Probably it's busy...</span>
                }
              </div>
            </div>
          </td>

          {
            categoryIds.map((categoryId) => {
              const categoryValue = card?.categoryValues?.filter((categoryValue) => categoryValue.cardId == card.id && categoryValue.categoryId == categoryId)[0];
              return <td key={`${categoryId}-${card.id}`}>
                    <input value={categoryValue?.value || ""}
                      className="block mx-auto w-8/12 text-center rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                      id={`categoryValue-${categoryValue?.id}`}
                      data-category-id={categoryId}
                      data-card-id={card.id}
                      onChange={OnChangeCategoryValue}
                      onBlur={onUpdateCard}>
                    </input>
                   </td>;
            })
          }
          <td className="text-center whitespace-nowrap px-2">
            <button onClick={onCreateCardAiGeneration} value={card.id} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Autocomplete</button>
            <button onClick={onDeleteCard} value={card.id} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-red-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-400 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Delete</button>
          </td>
        </tr>
        )
      );



      return (
        <div className="px-2 py-4 w-full bg-white space-y-4 flex flex-col">
          <div>
            <label htmlFor="deckName" className="block text-sm font-medium text-gray-700">
              Deck name
            </label>
            <div className="mt-1">
              <input
                className="pl-2 block rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                id="deckName"
                onChange={onChangeDeck}
                onBlur={onUpdateDeck}
                value={deck.name}
              />
            </div>
          </div>
          <div>
            <h2 className="h3">Card List</h2>

            <label>
              <input type="checkbox"
                name="Generate Images"
                checked={isGenerateImagesSelected}
                onChange={onGenerateImagesChanged}
                /> Should generate images when autocompleting
            </label>
            <div className='pt-2 flex'>
              <button onClick={onAutocompleteAll} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Autocomplete all</button>
              <button onClick={onCreateCard} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Create Card</button>
              {
                isLoading && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-spin my-auto mx-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                }
            </div>
          </div>
          {/* This height is arbitrary for the scroll it is dependant on the height of the child which is the table */}
          <div className="grow h-1 overflow-auto px-2">
            {/* This width is arbitrary for the scroll it is dependant on the height of the child which is the table */}
            <div className="w-1">
              <table className="mt-2 min-w-full divide-y divide-gray-300 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="">Name</th>
                    { categories }
                    <th scope="col" className="">Costume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  { cards }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      );
    }
    else {
      return (
        <div>
          <p>There is no deck associated with this project. Please create a new one</p>
          <button onClick={onCreateDeck} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Create Deck</button>
        </div>
      )
    }
}

DeckComponent.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    onCreateCard: PropTypes.func,
    onDeleteCard: PropTypes.func,
    onChangeCard: PropTypes.func,
    onUpdateCard: PropTypes.func,
    onChangeCategory: PropTypes.func,
    OnChangeCategoryValue: PropTypes.func,
    onCreateDeck: PropTypes.func,
    onUpdateDeck: PropTypes.func,
    onChangeDeck: PropTypes.func,
    onCreateCardAiGeneration: PropTypes.func,
    isGenerateImagesSelected: PropTypes.bool,
    onGenerateImagesChanged: PropTypes.func,
    onAutocompleteAll: PropTypes.func,
};

export default DeckComponent;