import PropTypes from 'prop-types';
import xhr from 'xhr';
import React from 'react';
import { connect } from 'react-redux';
import { costumeUpload } from '../../lib/file-uploader.js';
import VM from 'scratch-vm';
import { createCardInCostumes } from "../../lib/cambrian/costumes-utilities.js";
import { setDeckSyncedWithCostumes } from "../../reducers/cambrian/decks.js";

import { autoUpdateProject } from '../../reducers/project-state';

/* Higher Order Component to sync the costumes with the deck. It should
 * take all the cards from the deck and put then as costumens.
 * This is needed both when editing and when playing.
 *
 * It provides some of the methods as utitilies for others to use
 *
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with deck to costumes sync behavior
 */
const DeckToCostumesHOC = function (WrappedComponent) {
    class DeckToCostumesComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = {}
        }

        componentDidUpdate (prevProps) {
            // What is this logic doing?
            //
            // When we open a game we must sync the deck with the costumes
            // But this means that we change the costumes and suddenly the project is not saved
            // right after opening it. If we try to exit there will be a warning that the
            // project is not save.
            // So we save the project after syncing the deck. But this triggers the sync again
            // because we are reloading the component.
            // The logic below makes sure we sync once, then save and after the save we don't
            // sync.
            const hasProjectChanged = this.props.projectChanged && !prevProps.projectChanged;
            if (hasProjectChanged) {
              // project was changed. Does not matter how for now
              // The deck might not be synced with the costumes.
              this.props.onUnsyncDeckWithCostumes();
            }
            const hasShowedProject = this.props.isShowingProject && !prevProps.isShowingProject
            if (!this.props.deckSyncedWithCostumes && hasShowedProject) {
                // We wait for the project to be showed.
                this.syncDeckToCostumes();
            }

            const wasProjectSave = !this.props.projectChanged && prevProps.projectChanged
            if (wasProjectSave) {
                // Left empty. I think I will need it in the future and it is useful for debug
            }
        }

        render () {
            return (
                <WrappedComponent
                    {...this.props}
                />
            );
        }

        syncDeckToCostumes() {
            const {
              vm
            } = this.props;
            // Brute force sync them all. We sync names, pictures
            // and position. We will upload them all back to the server
            // and make post request. But doing it smarter requires a
            // much smarter API of what changed with the card, when and
            // how, in order to chagne only what changed.
            // One of the things is the url of the pictures. This url
            // contains a signature and this signature is different
            // each time so we can not such compare the url of the image
            // and decide if we should change the image.
            //
            // It will take about a day to figure how to do it in smart way here

            // this.createCardInCostumes(card, this);
            //
            // We first delete all the costumes and then crete the new ones
            // to avoid indexOf issues that occur when reordering the cards
            // in the createCardInCostumes
            this.loadDeckFromServer().then(()=> {
                return this.emptyAllCardCostumes()
            }).then(()=> {
                return this.recreateCostumesFromCards();
            }).then(()=> {
                return this.reorderCostumeBasedOnCards();
            }).then(()=> {
              this.props.onSyncDeckWithCostumes();
              this.props.onAutoUpdateProject();
            })
        }

        loadDeckFromServer() {
            const {
              decksHost,
              projectToken,
              projectId
            } = this.props;
            const promise = new Promise((resolve, reject) => {
              xhr({
                  method: 'GET',
                  uri: `${decksHost}/decks?game_id=${projectId}`,
                  headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${projectToken}`
                  },
                  json: true
              }, (error, response) => {

                  if (error || response.statusCode !== 200) {
                      this.setState(
                          {
                              ...this.state,
                              deck: undefined
                          }
                      )
                      return reject(new Error(response.status));
                  }
                  const lastDeck = response.body[response.body.length-1]
                  if(lastDeck) {
                    const deck =  {
                              cards: [],
                              ...lastDeck
                            }
                    this.setState(
                        {
                            ...this.state,
                            deck: deck

                        }
                    ) // take the first one as we know only how to handle the first one.
                    resolve(deck)
                  }
              })
            })
            return Promise.all([promise])
        }

        emptyAllCardCostumes() {
            const deck = this.state.deck;
            const scope = this;
            if(deck) {
                deck.cards.forEach((card)=> {
                  scope.deleteCardFromCostumes(card.id);
                })
                // along with deleting all the costumes for cards that are existing
                // we delete the costumes for cards that are not existing
                // We need this because of when a project is forked. When it is
                // there are costumes with card-'id' where there is not card with this id
                // as the card was duplicated
                const {
                  vm
                } = this.props;

                const costumes = vm.editingTarget.getCostumes().filter(costume => costume.name.startsWith(`card-`))
                costumes.forEach(costume => {
                  const index = vm.editingTarget.getCostumes().indexOf(costume)
                  vm.editingTarget.deleteCostume(index);
                })

                return deck;
            }
        }

        recreateCostumesFromCards() {
            const deck = this.state.deck;
            const scope = this;
            if(deck) {
                const allCreatePromises = deck.cards.map((card)=> {
                  return createCardInCostumes(card, this)
                })
                return Promise.all(allCreatePromises)
            }
        }

        reorderCostumeBasedOnCards() {
            const {
              vm
            } = this.props;
            // now we reorder them as the creates were in a promise
            const deck = this.state.deck;
            if(deck) {
                for(let i = 0; i < deck.cards.length; i++) {
                  const card = deck.cards[i]
                  const currentCostumeIndex = vm.editingTarget.getCostumes().findIndex(c=> c.name.startsWith(`card-${card.id}-`))
                  const newCostumeIndex = i;
                  vm.editingTarget.reorderCostume(currentCostumeIndex, i)
                }
            }
        }

        deleteCardFromCostumes(cardId) {
            const {
                vm
            } = this.props;

            const costumes = vm.editingTarget.sprite.costumes_.filter(costume=> costume.name.startsWith(`card-${cardId}-`))
            costumes.forEach(costume => {
              const index = vm.editingTarget.sprite.costumes_.indexOf(costume)
              vm.editingTarget.deleteCostume(index);
            })
        }

        addCostume (costume, targetId) {
            const costumes = Array.isArray(costume) ? costume : [costume];

            return Promise.all(costumes.map(c => {
                // If targetId is falsy, VM should default it to editingTarget.id
                // However, targetId should be provided to prevent #5876,
                // if making new costume takes a while
                return this.props.vm.addCostume(c.md5, c, targetId);
            }));
        }
    }
    DeckToCostumesComponent.propTypes = {
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        decksHost: PropTypes.string,
        isShowingProject: PropTypes.bool,
        vm: PropTypes.instanceOf(VM),
        projectChanged: PropTypes.bool,
    };

    const mapStateToProps = state => {
        return {
            projectId: state.scratchGui.projectState.projectId,
            vm: state.scratchGui.vm,
            deckSyncedWithCostumes: state.scratchGui.decks.deckSyncedWithCostumes,
            projectChanged: state.scratchGui.projectChanged
        };
    };

    const mapDispatchToProps = dispatch => ({
        onAutoUpdateProject: () => dispatch(autoUpdateProject()),
        onSyncDeckWithCostumes: () => dispatch(setDeckSyncedWithCostumes(true)),
        onUnsyncDeckWithCostumes: () => dispatch(setDeckSyncedWithCostumes(false))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(DeckToCostumesComponent);
}

export {
    DeckToCostumesHOC as default
};