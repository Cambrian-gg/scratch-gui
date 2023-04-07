import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import CambrianHOC from "../containers/cambrian/cambrian-hoc.jsx"
import DeckToCostumesHOC from "../containers/cambrian/deck-to-costumes-hoc.jsx"
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';

const onClickLogo = () => {
    window.location = 'https://www.cambrian.gg';
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC,
        CambrianHOC
    )(GUI);

    const searchParams = new URLSearchParams(window.location.href);
    const backpackHost = searchParams.get('backpack_host');
    const projectHost = searchParams.get('game_host');
    const deckHost = searchParams.get('deck_host');
    const splitAssetHost = searchParams.get('asset_host')?.split("#");
    let assetHost;
    if (splitAssetHost){
        assetHost = splitAssetHost[0];
    }

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const urlParams = Object.fromEntries(urlSearchParams.entries());

    ReactDOM.render(
        // important: this is checking whether `simulateScratchDesktop` is truthy, not just defined!
        simulateScratchDesktop ?
            <WrappedGui
                canEditTitle
                isScratchDesktop
                showTelemetryModal
                canSave={false}
                onTelemetryModalCancel={handleTelemetryModalCancel}
                onTelemetryModalOptIn={handleTelemetryModalOptIn}
                onTelemetryModalOptOut={handleTelemetryModalOptOut}
            /> :
            <WrappedGui
                canEditTitle
                backpackVisible
                showComingSoon
                backpackHost={backpackHost}
                canSave={true}
                canCreateNew={true}
                projectToken={urlParams.token}
                // projectHost={projectHost || "http://localhost:3030/scratch/games"}
                // decksHost={deckHost || "http://localhost:3030/scratch"}
                // assetHost={assetHost || "http://localhost:3030/scratch/assets"}
                projectHost={"https://www.cambrian.gg/scratch/games"}
                decksHost={"https://www.cambrian.gg/scratch"}
                assetHost={"https://www.cambrian.gg/scratch/assets"}
                onClickLogo={onClickLogo}
                logo="https://www.cambrian.gg/assets/text-logo-dadaf9faac43fab06d46fadac4736e61b148d203fc656759f3dbf30a6aaabaaf.png"
            />,
        appTarget);
};
