import PropTypes from 'prop-types';
import React from 'react';
import DeckComponent from '../../components/cambrian/deck-component.jsx'
import errorBoundaryHOC from '../../lib/error-boundary-hoc.jsx';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import bindAll from 'lodash.bindall';
import xhr from 'xhr';

class Deck extends React.Component {
    constructor(props) {
        super(props);
          bindAll(this, [
              'handleCreateCard',
              'handleChangeCard',
              'handleDeleteCard',
              'handleCreateDeck',
              'handleUpdateDeck',
              'handleChangeDeck',
              'handleCreateCardAiGeneration'
          ]);
          this.state = {
            // deck: {
            //   cards: [
            //     { id: "card-t-rex", name: "T-Rex", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //     { id: "card-stegasaurus", name: "Stegasaurus", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //     { id: "card-triceraptors", name: "Triceraptors", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //   ]
            // }
          }
    }

    componentDidMount() {
        const {
          host,
          token,
          projectId
        } = this.props;
        const promise = new Promise((resolve, reject) => {
          xhr({
              method: 'GET',
              uri: `${host}/scratch/decks?project_id=${projectId}`,
              headers: {
                "Content-Type": 'application/json',
                'Authorization': `Bearer ${token}`
              },
              json: true
          }, (error, response) => {

              if (error || response.statusCode !== 200) {
                  this.setState(
                      {
                          deck: undefined
                      }
                  )
                  return reject(new Error(response.status));
              }
              const lastDeck = response.body[response.body.length-1]
              if(lastDeck) {
                this.setState(
                    {
                        deck: {
                          cards: [],
                          ...lastDeck
                        }
                    }
                ) // take the first one as we know only how to handle the first one.
              }
          })
        })
        Promise.all([promise]).catch(() => {
          console.warn("error getting a deck")
        })
    }

    handleCreateCard (name) {
        const {
          host,
          token
        } = this.props;

        const deckId = this.state.deck.id;

        const promise = new Promise((resolve, reject) => {
          xhr({
            method: 'POST',
            uri: `${host}/scratch/cards`,
            headers: {
              "Content-Type": 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              "card": {
                "deck_id": deckId,
              }
            })
          }, (error, response) => {
              if (error || response.statusCode !== 200) {
                  return reject(new Error(response.status));
              }
              if(response.body[0]) {
                const newCard = JSON.parse(response.body)
                const deck = this.state.deck;
                this.setState(
                    {
                        deck: {
                          ...deck,
                          cards: [...deck.cards, newCard]
                        }
                    }
                )
              }
          })
       })
      Promise.all([promise])
    }

    handleChangeCard(event) {
        const cardId = event.target.parentElement.parentElement.id.split("-")[1]
        const deck = this.state.deck;
        const card = deck.cards.filter((card)=> {
            return card.id == cardId
        })[0]
        card.name = event.target.value
        this.setState({
          ...this.state,
          deck: deck
        })
    }

    handleDeleteCard(event) {
        const {
          host,
          token
        } = this.props;

        const cardId = event.target.value;

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'DELETE',
                uri: `${host}/scratch/cards/${cardId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, host);
            });
        });
        Promise.all([promise]).then(() => {
          const newCards = this.state.deck.cards.filter(card=> {
            return card.id != cardId
          })

          const deck = this.state.deck;

          this.setState(
              {
                  deck: {
                    ...deck,
                    cards: newCards
                  }
              }
          )
        })
    }

    handleCreateCardAiGeneration(event) {
        const {
          host,
          token
        } = this.props;

        const cardId = event.target.value;

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${host}/scratch/card_ai_generations/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: {
                    "card_ai_generation": {
                        "card_id" : cardId
                    }
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, host);
            });
        });
        Promise.all([promise]).then()
    }

    handleCreateDeck() {
        const {
          host,
          token,
          projectId
        } = this.props;

        if(projectId == null || projectId == undefined || projectId == 0) {
          alert("Please save the project first.")
          return;
        }

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${host}/scratch/decks/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  "deck": {
                    "project_id": projectId
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                const deck = JSON.parse(response.body)
                this.setState({
                  deck: {
                    cards: [],
                    ...deck
                  }
                })
            });
        });
        Promise.all([promise])
    }

    handleChangeDeck(event) {
      const deckName = event.target.value;
      this.setState({
        ...this.state,
        deck: {
          ...this.state.deck,
          name: deckName
        }
      })
    }

    handleUpdateDeck(event) {
        const {
          host,
          token
        } = this.props;

        const deck = this.state.deck;
        const deckId = deck.id;
        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'PUT',
                uri: `${host}/scratch/decks/${deckId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  "deck": {
                    // We expect them as cards_attributes in the API, not as cards
                    "cards_attributes": deck.cards,
                    "name": deck.name
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, host);
            });
        });
        Promise.all([promise])
    }

    render () {
        return (
            <DeckComponent
                deck={this.state.deck}
                onCreateCard={this.handleCreateCard}
                onChangeCard={this.handleChangeCard}
                onDeleteCard={this.handleDeleteCard}
                onCreateDeck={this.handleCreateDeck}
                onUpdateDeck={this.handleUpdateDeck}
                onChangeDeck={this.handleChangeDeck}
                onCreateCardAiGeneration={this.handleCreateCardAiGeneration}
              />
        )

    }
}

Deck.propTypes = {
  host: PropTypes.string,
  token: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const mapStateToProps = state => ({
});


const mapDispatchToProps = dispatch => ({
});

export default errorBoundaryHOC('Deck')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(Deck))
);
