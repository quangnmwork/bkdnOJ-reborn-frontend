import React from "react";
import {createRoot} from "react-dom/client";

// Redux
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import store, {persistor} from "redux/store.js";

// Toastify
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastConfig from "configs/toast";
import "bootstrap/dist/css/bootstrap.min.css";

// MathJax
// import { MathJaxContext } from "better-react-mathjax";
// import mathjaxConfig from 'configs/mathjax';

import App from "App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
    <ToastContainer {...toastConfig} />
  </React.StrictMode>
);
