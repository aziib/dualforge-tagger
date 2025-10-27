import React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App.js';

// Mount the React application into the #root element.  We use the
// older ReactDOM.render API because React 19 may not yet include
// createRoot on all environments and using it complicates the import.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// ReactDOM.render is still available for compatibility; in newer
// versions of React you can switch to ReactDOM.createRoot() if
// desired.
ReactDOM.render(
  React.createElement(React.StrictMode, null, React.createElement(App)),
  rootElement
);