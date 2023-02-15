import PropTypes from 'prop-types';
import React from 'react';

function DeckComponent(props) {

    const {
      onCreateCard,
      onChangeCard,
      onSelectCard,
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
      onAutocompleteSelected,
      onDeleteSelected,
      onToggleSelectedForAll,
      deck,
      selectedCardIds,
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
            <input
              type="checkbox"
              class="mr-4 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={selectedCardIds.includes(card.id)}
              onChange={onSelectCard}
              data-card-id={card.id}
              />
              <div className="h-20 w-20 flex-shrink-0">
                <img className="h-20 w-20 rounded-sm" src={card.imageUrl}></img>
              </div>
              <div className="ml-4 w-full">
                <input
                  style={{ minWidth: "8rem" }}
                  className="block mx-auto w-full pl-2 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                  onChange={onChangeCard}
                  onBlur={onUpdateCard}
                  value={card.name}
                  data-card-id={card.id}
                  >
                </input>
                { card.cardAiGenerations.some(cag => cag["completedAt"] == null) && <span>Autocompleting please wait...</span> }
                {
                  // Here we directly print the error from the platform. No modification
                  // The platform has prepared it for us
                  // I HATE JSX. This way of doing things looks and feels awful.
                  card.cardAiGenerations.find(cag => cag["humanReadableError"] && cag["humanReadableError"]["code"] != "200") != null
                    && <span>{ card.cardAiGenerations.find(cag => cag["humanReadableError"] && cag["humanReadableError"]["code"] != "200")["humanReadableError"]["message"] }</span>
                }
              </div>
            </div>
          </td>

          {
            categoryIds.map((categoryId) => {
              const categoryValue = card?.categoryValues?.filter((categoryValue) => categoryValue.cardId == card.id && categoryValue.categoryId == categoryId)[0];
              const parsedValue = parseInt(categoryValue?.value,10);
              const value = isNaN(parsedValue) ? "" : parsedValue;
              return <td key={`${categoryId}-${card.id}`}>
                    <input value={value}
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

      const selectedLabel = () => {
        if (selectedCardIds.length == deck.cards.length || selectedCardIds.length == 0) {
          return `${selectedCardIds.length}`;
        }
        return `${selectedCardIds.length}/${deck.cards.length}`
      }

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
            <h2 className="h3">Card List ({deck.cards.length})</h2>

            <label>
              <input type="checkbox"
                name="Generate Images"
                checked={isGenerateImagesSelected}
                onChange={onGenerateImagesChanged}
                /> Should generate images when autocompleting
            </label>
            <div className='pt-2 flex'>
              <button onClick={onCreateCard} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Create Card</button>

              <button onClick={onToggleSelectedForAll} data-selected-value="true" className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Select all</button>

              <button onClick={onToggleSelectedForAll} data-selected-value="false" className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Deselect all</button>

              <button onClick={onAutocompleteSelected} className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Autocomplete selected ({selectedLabel()})</button>

              <button onClick={onDeleteSelected} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">Delete selected ({selectedLabel()})</button>

              {
                isLoading && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-spin my-auto mx-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                }
            </div>
          </div>
          {/* This height is arbitrary for the scroll it is dependant on the height of the child which is the table */}
          <div className="grow h-1 overflow-auto px-2">
            <div>
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