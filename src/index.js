import React from "react";
import ReactDOM from "react-dom";

// Components
import App from "components/App";

// Styles
import "styles/index.css";
import "normalize.css";
import "font-awesome/css/font-awesome.css";

// Mobx
import store from "stores";
import { Provider } from "mobx-react";

// antd
import LocaleProvider from "antd/lib/locale-provider";
import enUS from "antd/lib/locale-provider/en_US";

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
      <App />
    </LocaleProvider>
  </Provider>,
  document.getElementById("root")
);
