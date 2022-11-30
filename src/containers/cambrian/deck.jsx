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
              'handleAddCard',
              'handleDeleteCard',
              'handleSaveDeck'
          ]);
          this.state = {
            deck: {
              cards: [
                { id: "card-t-rex", name: "T-Rex", size: 4, height: 4, strength: 4, image: "https://ddd" },
                { id: "card-stegasaurus", name: "Stegasaurus", size: 4, height: 4, strength: 4, image: "https://ddd" },
                { id: "card-triceraptors", name: "Triceraptors", size: 4, height: 4, strength: 4, image: "https://ddd" },
              ]
            }
          }
    }

    componentDidMount() {
      const {
        host,
        token,
        projectId
      } = this.props;

      xhr({
          method: 'GET',
          uri: `${host}/scratch_decks?project_id=${projectId}`,
          headers: {
            "Content-Type": 'application/json',
            'Authorization': `Bearer ${token}`
          },
          json: true
      }, (error, response) => {
          if (error || response.statusCode !== 200) {
              return reject(new Error(response.status));
          }
          if(response.body[0]) {
            this.setState(
                {
                    deck: response.body[0]
                }
            ) // take the first one as we know only how to handle the first one.
          }
      })
    }

    handleAddCard (name) {
        name = new Date().getTime().toString()
        const newCard = { id: `card-${name}`, name: `card-${name}`, size: 4, height: 4, strength: 4, image: "https://ddd" }
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

    handleDeleteCard(event) {
        const newCards = this.state.deck.cards.filter(card=> {
          return card.name != event.target.value
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
    }

    handleSaveDeck(event) {
        if(this.state.deck.id) {
            this.updateDeckOnServer(this.state.deck.id);
        } else {
            this.createDeckOnServer();
        }
    }

    updateDeckOnServer(deckId) {
        const {
          host,
          token
        } = this.props;

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'PUT',
                uri: `${host}/scratch_decks/${deckId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  "deck": {
                    "cards": JSON.stringify(this.state.deck.cards),
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

    createDeckOnServer() {
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
                uri: `${host}/scratch_decks/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  "deck": {
                    "cards": JSON.stringify(this.state.deck.cards),
                    "project_id": projectId
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
                onDeleteCard={this.handleDeleteCard}
                onAddCard={this.handleAddCard}
                onSaveDeck={this.handleSaveDeck}
              />
        )
    }
}

Deck.propTypes = {
  host: PropTypes.string,
  token: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
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
