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

import Deck from "./cambrian/deck.jsx"

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
    }

    render () {
        let projectId = this.props.reduxProjectId;
        const urlSearchParams = new URLSearchParams(window.location.search);
        const urlParams = Object.fromEntries(urlSearchParams.entries());
        if(projectId == null || projectId == undefined) {
            const hashMatch = window.location.hash.match(/#(\d+)/);
            projecId = hashMatch === null ? 0 : hashMatch[1];
        }
        return (
            <Deck
              host={"http://localhost:3030"}
              token={"Vsv4eVB6bm4123xSpQgngasr"}
              projectId={"9"}
            />
            // <Deck
            //   host={"https://cambrian-gg.herokuapp.com"}
            //   token={urlParams.token}
            //   projectId={projectId}
            // />
        )
    }
}

AITab.propTypes = {
  reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

const mapStateToProps = state => {
  return {
    reduxProjectId: state.scratchGui.projectState.projectId
  }
};

const mapDispatchToProps = dispatch => ({
});

export default errorBoundaryHOC('AI Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AITab))
);

