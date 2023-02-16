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

// I hate JS.
// There is not an easy way to parse an url, change something in it
// and them construct it again. The main issue is around encoding.
// When the values are simple then JS API methods work. But when they are not
// then...
const urlParams = new URLSearchParams(window.location.search);
const discardSmallSize = urlParams.get('discard-small-size') == 'true';
let urlWithDiscard = window.location.href.split("#")[0]
urlWithDiscard=urlWithDiscard.split("&").map((x)=> {
    if(x.indexOf("discard-small-size")==0) {
      return "discard-small-size=true"
    } else {
      return x;
    }
  }).join("&")

if(urlWithDiscard.indexOf("discard-small-size")==-1) {
  urlWithDiscard+="&discard-small-size=true"
}

const projectId = window.location.href.split("#")[1]
if(projectId) {
  urlWithDiscard += `#${projectId}`
}

if (supportedBrowser() && (window.innerWidth >= 1024 || discardSmallSize)) {
    // require needed here to avoid importing unsupported browser-crashing code
    // at the top level
    require('./render-gui.jsx').default(appTarget);

} else if( supportedBrowser() && window.innerWidth < 1024 && !discardSmallSize) {
  const html = `
        <div style="margin: 24px">
          <div>
            <h1 style="font-size: 24px">Cambrian Code editor</h1>
            <p>We need at least <strong>1024px</strong> of visible screen width.</p>
            <p>Anything less than that makes it difficult to use the editor.</p>
            <p>Current visible screen width is <strong>${window.innerWidth}px</strong>.</p>

          </div>
          <div style="padding-top: 24px">
            <a href="${urlWithDiscard}" style="color: blue">Proceed</a> (if you have a big heart and a lot of patience)
          </div>
        </div>
    `
  appTarget.append(new DOMParser().parseFromString(html, 'text/html').body.childNodes[0])
} else {
    BrowserModalComponent.setAppElement(appTarget);
    const WrappedBrowserModalComponent = AppStateHOC(BrowserModalComponent, true /* localesOnly */);
    const handleBack = () => {};
    // eslint-disable-next-line react/jsx-no-bind
    ReactDOM.render(<WrappedBrowserModalComponent onBack={handleBack} />, appTarget);
}
