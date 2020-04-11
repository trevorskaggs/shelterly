import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Shelterly from './Shelterly';
import * as serviceWorker from './serviceWorker';
import {AuthProvider} from "./accounts/AccountsReducer";

ReactDOM.render(<AuthProvider><Shelterly /></AuthProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
