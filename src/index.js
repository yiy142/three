import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ThreeCanvas from './canvas';
import Tool from './tool';

ReactDOM.render(<ThreeCanvas />, document.getElementById('map'));
ReactDOM.render(<Tool />, document.getElementById('tool'));