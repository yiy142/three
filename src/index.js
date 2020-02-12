import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ThreeCanvas from './canvas';
import MapSelector from './selector';
import POIController from './controller';

ReactDOM.render(<ThreeCanvas />, document.getElementById('map'));
ReactDOM.render(<MapSelector />, document.getElementById('selector'));