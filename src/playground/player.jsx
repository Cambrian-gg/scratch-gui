import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Box from '../components/box/box.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import CambrianHOC from "../containers/cambrian/cambrian-hoc.jsx"
import DeckToCostumesHOC from "../containers/cambrian/deck-to-costumes-hoc.jsx"

import {setPlayer} from '../reducers/mode';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

import styles from './player.css';

const Player = ({isPlayerOnly, onSeeInside, projectId, projectHost, decksHost, assetHost}) => (
    <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
        {isPlayerOnly && <button onClick={onSeeInside}>{'See inside'}</button>}
        <GUI
            canEditTitle
            enableCommunity
            isPlayerOnly={isPlayerOnly}
            projectId={projectId}
            projectHost={projectHost}
            decksHost={decksHost}
            assetHost={assetHost}
        />
    </Box>
);

Player.propTypes = {
    isPlayerOnly: PropTypes.bool,
    onSeeInside: PropTypes.func,
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSeeInside: () => dispatch(setPlayer(false))
});

const ConnectedPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer = compose(
    AppStateHOC,
    HashParserHOC,
    CambrianHOC,
    DeckToCostumesHOC
)(ConnectedPlayer);

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<WrappedPlayer
                  isPlayerOnly
                  // TODO: Extract the project, asset and deck hosts to a component
                  // projectHost={"http://localhost:3030/scratch/games"}
                  // decksHost={"http://localhost:3030/scratch"}
                  // assetHost={"http://localhost:3030/scratch/assets"}
                  projectHost={"https://cambrian.gg/scratch/games"}
                  decksHost={"https://cambrian.gg/scratch"}
                  assetHost={"https://cambrian.gg/scratch/assets"}
                />, appTarget);
