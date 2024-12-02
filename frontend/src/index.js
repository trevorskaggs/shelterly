import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "bootswatch/dist/darkly/bootstrap.min.css";
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import * as serviceWorker from './serviceWorker';
import { CookiesProvider } from 'react-cookie';
import Shelterly from './Shelterly';
import { AuthProvider } from "./accounts/AccountsReducer";
import { SystemErrorProvider } from './components/SystemError';
import {
  NodeManager,
} from "react-register-nodes";

ReactDOM.render(<CookiesProvider><AuthProvider><SystemErrorProvider><NodeManager><Shelterly /></NodeManager></SystemErrorProvider></AuthProvider></CookiesProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
