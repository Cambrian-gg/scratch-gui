import PropTypes from 'prop-types';
import xhr from 'xhr';
import React from 'react';
import { connect } from 'react-redux';
import { costumeUpload } from '../../lib/file-uploader.js';
import VM from 'scratch-vm';
import { createCardInCostumes } from "../../lib/cambrian/costumes-utilities.js";
import {
  setDeckSyncedWithCostumes,
  setDeck
} from "../../reducers/cambrian/decks.js";

import { autoUpdateProject } from '../../reducers/project-state';
import consumer from "../../cable.js"

import {
    activateTab,
    AI_TAB_INDEX
} from '../../reducers/editor-tab';

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
        }

        componentDidMount() {
            consumer.subscriptions.create({
                channel: 'DecksChannel',
                username: 'kmitov@axlessoft.com',
            }, {
                connected: () => console.log('connected'),
                disconnected: () => console.log('disconnected'),
                received: data => {
                  console.log("Deck::receive event for deck. Setting deck synced to false")
                  // FIXME. This should not refresh the whole deck. Only part of it
                  // For the moment we are refreshing the whole deck
                  this.props.setDeckSyncedWithCostumes(false);
                }
            })
        }

        componentWillUnmount() {
            consumer.disconnect()
        };

        componentDidUpdate (prevProps, prevState) {
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
              // console.log("DeckToCostumesHOC::onUnsyncDeckWithCostumes")
              this.props.onUnsyncDeckWithCostumes();
            }
            const hasShowedProject = this.props.isShowingProject && !prevProps.isShowingProject
            if (!this.props.deckSyncedWithCostumes && hasShowedProject) {
                // console.log("DeckToCostumesHOC:: !this.props.deckSyncedWithCostumes && hasShowedProject ")
                // We wait for the project to be showed.
                this.syncDeckToCostumes();
            } else if (this.props.deckSyncedWithCostumes == false && prevProps.deckSyncedWithCostumes == true) {
                // console.log("DeckToCostumesHOC:: this.props.deckSyncedWithCostumes == false && prevProps.deckSyncedWithCostumes == true")
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
            // console.log("DeckToCostumesHOC::syncDeckToCostumes")
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
            return this.loadDeckFromServer().then((deck) => {
            //     return this.emptyAllCardCostumes()
            // }).then(()=> {
            //     return this.recreateCostumesFromCards();
            // }).then(()=> {
            //     return this.reorderCostumesBasedOnCards();
                const costumesTarget = this.findCostumesTarget(vm, deck)
                if(costumesTarget) {
                    const scope = this;

                    const syncCostumesPromise = new Promise((resolve, reject) => {
                      scope.emptyAllCardCostumes(costumesTarget);
                      scope.recreateCostumesFromCards(costumesTarget).then(()=> {
                        scope.reorderCostumesBasedOnCards(costumesTarget);
                        resolve();
                      })
                    })
                    return syncCostumesPromise;
                } else {
                  // nothing to do here. We are in another sprite
                  return Promise.resolve()
                }
            }).then(()=> {
              this.props.onSyncDeckWithCostumes();
              this.props.onAutoUpdateProject();
            })
        }

        loadDeckFromServer() {
            const {
              decksHost,
              projectToken,
              projectId,
              vm
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
                      this.props.setDeck(undefined)
                      return reject(new Error(response.status));
                  }
                  const lastDeck = response.body[response.body.length-1]
                  if(lastDeck) {
                    const deck =  {
                              cards: [],
                              ...lastDeck
                            }
                    // There are games for which we must init the costumesSpriteName with a default value
                    // as we are introducing the property after there are so many games
                    // This could be initialized by hand with all the games or we can
                    // find some logic to do it. We can just open the old games and initialize it.
                    if(deck.costumesSpriteName == null && vm.runtime.targets.filter(t => t.sprite.name == "Sprite1")[0]) {
                      deck.costumesSpriteName = "Sprite1"
                    }
                    this.props.setDeck(deck)
                    // take the first one as we know only how to handle the first one.
                    resolve(deck)
                  }
              })
            })
            return promise
        }

        emptyAllCardCostumes(costumesTarget) {
            // console.log("DeckToCostumesHOC::emptyAllCardCostumes")
            const deck = this.props.deck;
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

                const costumes = costumesTarget.getCostumes().filter(costume => costume.name.startsWith(`card-`))
                costumes.forEach(costume => {
                  const index = costumesTarget.getCostumes().indexOf(costume)
                  costumesTarget.deleteCostume(index);
                })
                return deck;
            }
        }

        findCostumesTarget(vm, deck) {
            return vm.runtime.targets.filter( t => t.sprite.name == deck.costumesSpriteName)[0]
        }

        recreateCostumesFromCards(costumesTarget) {
            // console.log("DeckToCostumesHOC::recreateCostumesFromCards")
            const deck = this.props.deck;
            const scope = this;
            let allCreatePromises = []
            if(deck) {
                allCreatePromises = deck.cards.map((card)=> {
                  return createCardInCostumes(card, costumesTarget, this)
                })
            }
            return Promise.all(allCreatePromises)
        }

        reorderCostumesBasedOnCards(costumesTarget) {
            // console.log("DeckToCostumesHOC::reorderCostumesBasedOnCards")
            const {
              vm
            } = this.props;
            // now we reorder them as the creates were in a promise
            const deck = this.props.deck;
            if(deck) {
                for(let i = 0; i < deck.cards.length; i++) {
                  const card = deck.cards[i]
                  const currentCostumeIndex = costumesTarget.getCostumes().findIndex(c=> c.name.startsWith(`card-${card.id}-`))
                  const newCostumeIndex = i;
                  costumesTarget.reorderCostume(currentCostumeIndex, i)
                }
            }
        }

        deleteCardFromCostumes(cardId) {
            const {
                vm,
                deck
            } = this.props;

            const costumesTarget = this.findCostumesTarget(vm, deck)
            if(costumesTarget) {
              const costumes = costumesTarget.sprite.costumes_.filter(costume=> costume.name.startsWith(`card-${cardId}-`))
              costumes.forEach(costume => {
                const index = costumesTarget.sprite.costumes_.indexOf(costume)
                costumesTarget.deleteCostume(index);
              })
            }
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
        onActivateTab: PropTypes.func,
        // This one should be a 'shape of'
        deck: PropTypes.any
    };

    const mapStateToProps = state => {
        return {
            projectId: state.scratchGui.projectState.projectId,
            vm: state.scratchGui.vm,
            deckSyncedWithCostumes: state.scratchGui.decks.deckSyncedWithCostumes,
            projectChanged: state.scratchGui.projectChanged,
            deck: state.scratchGui.decks.deck
        };
    };

    const mapDispatchToProps = dispatch => ({
        onAutoUpdateProject: () => dispatch(autoUpdateProject()),
        onSyncDeckWithCostumes: () => dispatch(setDeckSyncedWithCostumes(true)),
        onUnsyncDeckWithCostumes: () => dispatch(setDeckSyncedWithCostumes(false)),
        onActivateTab: tab => dispatch(activateTab(tab)),
        setDeckSyncedWithCostumes: (value) => dispatch(setDeckSyncedWithCostumes(value)),
        setDeck: deck => dispatch(setDeck(deck)),
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(DeckToCostumesComponent);
}

export {
    DeckToCostumesHOC as default
};