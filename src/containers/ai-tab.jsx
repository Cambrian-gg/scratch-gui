import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import PaintEditorWrapper from './paint-editor-wrapper.jsx';
import {connect} from 'react-redux';
import {handleFileUpload, costumeUpload} from '../lib/file-uploader.js';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import DragConstants from '../lib/drag-constants';
import {emptyCostume} from '../lib/empty-assets';
import sharedMessages from '../lib/shared-messages';
import downloadBlob from '../lib/download-blob';

import {
    openCostumeLibrary,
    openBackdropLibrary
} from '../reducers/modals';

import {
    activateTab,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

import {setRestore} from '../reducers/restore-deletion';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';

import addLibraryBackdropIcon from '../components/asset-panel/icon--add-backdrop-lib.svg';
import addLibraryCostumeIcon from '../components/asset-panel/icon--add-costume-lib.svg';
import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import paintIcon from '../components/action-menu/icon--paint.svg';
import surpriseIcon from '../components/action-menu/icon--surprise.svg';
import searchIcon from '../components/action-menu/icon--search.svg';

import costumeLibraryContent from '../lib/libraries/costumes.json';
import backdropLibraryContent from '../lib/libraries/backdrops.json';

let messages = defineMessages({
    addLibraryBackdropMsg: {
        defaultMessage: 'Choose a Backdrop',
        description: 'Button to add a backdrop in the editor tab',
        id: 'gui.costumeTab.addBackdropFromLibrary'
    },
    addLibraryCostumeMsg: {
        defaultMessage: 'Choose a Costume',
        description: 'Button to add a costume in the editor tab',
        id: 'gui.costumeTab.addCostumeFromLibrary'
    },
    addBlankCostumeMsg: {
        defaultMessage: 'Paint',
        description: 'Button to add a blank costume in the editor tab',
        id: 'gui.costumeTab.addBlankCostume'
    },
    addSurpriseCostumeMsg: {
        defaultMessage: 'Surprise',
        description: 'Button to add a surprise costume in the editor tab',
        id: 'gui.costumeTab.addSurpriseCostume'
    },
    addFileBackdropMsg: {
        defaultMessage: 'Upload Backdrop',
        description: 'Button to add a backdrop by uploading a file in the editor tab',
        id: 'gui.costumeTab.addFileBackdrop'
    },
    addFileCostumeMsg: {
        defaultMessage: 'Upload Costume',
        description: 'Button to add a costume by uploading a file in the editor tab',
        id: 'gui.costumeTab.addFileCostume'
    }
});

messages = {...messages, ...sharedMessages};

class AITab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleNewCard',
            'handleDeleteCard'
        ]);
        this.state = {
          cards: [
            { id: "card-t-rex", name: "T-Rex", size: 4, height: 4, strength: 4, image: "https://ddd" },
            { id: "card-stegasaurus", name: "Stegasaurus", size: 4, height: 4, strength: 4, image: "https://ddd" },
            { id: "card-triceraptors", name: "Triceraptors", size: 4, height: 4, strength: 4, image: "https://ddd" },
          ]
        }
    }

    componentWillReceiveProps (nextProps) {
    }

    handleNewCard (name) {
      name = new Date().getTime().toString()
      const newCard = { id: `card-${name}`, name: `card-${name}`, size: 4, height: 4, strength: 4, image: "https://ddd" }
      this.setState({ cards: [...this.state.cards, newCard] } );
    }

    handleDeleteCard(event) {
      const newCards = this.state.cards.filter(card=> {
        return card.name != event.target.value
      })

      this.setState({ cards: newCards })
    }

    render () {
        const cards = this.state.cards?.map((card)=> (
          <tr key={card.id}>
            <td>{card.name}</td>
            <td>{card.size}</td>
            <td>{card.height}</td>
            <td>{card.strength}</td>
            <td>{card.image}</td>
            <td><button onClick={this.handleDeleteCard} value={card.name} className="btn btn-red">Delete</button></td>
          </tr>
          )
        );

        return (
          <div className  ="container px-4 mx-auto my-8">
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
              <button onClick={this.handleNewCard} className="btn btn-white">New Card</button>
            </div>
          </div>
        );
    }
}

AITab.propTypes = {
};

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default errorBoundaryHOC('AI Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AITab))
);
