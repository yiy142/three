import React from 'react';
import * as canvas_api from "utils/canvas.js"

export default class ThreeCanvas extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas_api.initialize("canvas", w, h);
}


  render() {
    return (
      <div>
        <div id="canvas"></div>
        {/* <canvas id="stitch_2d" style={{ visibility: 'hidden' }}></canvas> */}
      </div>
    );
  }
}
