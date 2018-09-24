import React from 'react';
import ReactDOM from 'react-dom';
import { autoPlay } from 'es6-tween';
import { scaleWidth } from '@gera2ld/rem';
import App from './components/app';
import './style.css';

scaleWidth();
autoPlay(true);
const root = document.createElement('div');
document.body.append(root);
ReactDOM.render(<App />, root);
