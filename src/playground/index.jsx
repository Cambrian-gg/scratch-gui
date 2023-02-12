// Polyfills
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'intl'; // For Safari 9

import React from 'react';
import ReactDOM from 'react-dom';

import analytics from '../lib/analytics';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import supportedBrowser from '../lib/supported-browser';

import styles from './index.css';

// Register "base" page view
analytics.pageview('/');

const appTarget = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

if (supportedBrowser() && window.innerWidth >= 1024) {
    // require needed here to avoid importing unsupported browser-crashing code
    // at the top level
    require('./render-gui.jsx').default(appTarget);

} else if( supportedBrowser() && window.innerWidth < 1024) {
  const html = `
        <div>
          <h1>Cambrian Code editor</h1>
          <p>We need at least 1024px of visible screen.</p>
          <p>Anything less than that makes it difficult to use the editor.</p>
        </div>,
    `
  appTarget.append(new DOMParser().parseFromString(html, 'text/html').body.childNodes[0])
} else {
    BrowserModalComponent.setAppElement(appTarget);
    const WrappedBrowserModalComponent = AppStateHOC(BrowserModalComponent, true /* localesOnly */);
    const handleBack = () => {};
    // eslint-disable-next-line react/jsx-no-bind
    ReactDOM.render(<WrappedBrowserModalComponent onBack={handleBack} />, appTarget);
}
