import WGS84Helper from "utils/WGS84Helper"
import * as canvas from "utils/canvas.js"
import * as validator from "utils/validator.js"

const _ = require("lodash");

let JSONtoTHREE = function () {
    let wgs84Helper =new WGS84Helper();
    let lot_lane = {};

    function readJSON(data){
        let config = data.config;
        window.map_anchor = config.anchor;
        window.map_offset = config.offset;
        let poiList = Object.keys(data);
        console.log(poiList);
        poiList.map(poiName=>{
            let curPoiGroup = data[poiName];
            switch (poiName){
                case "lanes":  renderLines(curPoiGroup); break;
                case "lots": renderLots(curPoiGroup); break;
                case "human_access": renderSquare(curPoiGroup); break;
                case "no_parking_zone": renderSquare(curPoiGroup); break;
                case "config": break;
                default: renderCube(curPoiGroup); break;

            }
        });
    }


    function renderLines(lanes){
        for(let laneName in lanes){
            let lane_wgs84 = lanes[laneName];
            let lane = {};
            lane.pts = new Array();

            let pts = lane_wgs84.pts;
            for(let pt of pts){
                lane.pts.push(wgs84Helper.Geodetic2Relative(pt));
            }
            lane.id = lane_wgs84.id;
            lane.type = lane_wgs84.type;
            lane.timestamp = lane_wgs84.timestamp;
            lane.style = lane_wgs84.style;
            canvas.draw_lanes(lane);
        }
    }

    function renderLots(lots){
        for(let lotName in lots){
            let lot_wgs84 = lots[lotName];
            let corners_wgs84 = lot_wgs84.corners;
            let lot = {};
            lot.corners = new Array();
            let x_sum = 0;
            let y_sum = 0;
            for(let cor_wgs84 of corners_wgs84){
                let corner = wgs84Helper.Geodetic2Relative(cor_wgs84);
                x_sum += corner.x;
                y_sum += corner.y;
                lot.corners.push(corner);
            }
            lot.cpos = {
                x:x_sum /4,
                y:y_sum / 4,
                z:lot.corners[0].z
            };

            lot.epos = {
                x:(lot.corners[0].x + lot.corners[3].x) / 2,
                y:(lot.corners[0].y + lot.corners[3].y) / 2,
                z:lot.corners[0].z
            };

            lot.id = lot_wgs84.id;
            lot.timestamp = lot_wgs84.timestamp;
            lot.type = lot_wgs84.type;
            // let lane = lot_lane[lot.id];
            // let wrong = validator.checkDirection(lot);
            let wrong = false;
            canvas.draw_lots(lot, wrong);
        }
    }

    function renderCube(cubes){

        for(let cubeName in cubes){
            let cube_wgs84 = cubes[cubeName];
            let corners_wgs84 = cube_wgs84.corners;
            let cube = {};
            cube.corners = new Array();
          
            for(let cor_wgs84 of corners_wgs84){
                let corner = wgs84Helper.Geodetic2Relative(cor_wgs84);
                cube.corners.push(corner);
            }
            cube.id = cube_wgs84.id;
            cube.timestamp = cube_wgs84.id;
            cube.type = cube_wgs84.type;

            canvas.draw_cube(cube);
        }
    }

    function renderSquare(squares){
        for(let squareName in squares){
            let square_wgs84 = squares[squareName];
            let corners_wgs84 = square_wgs84.corners;
            let square = {};
            square.corners = new Array();
          
            for(let cor_wgs84 of corners_wgs84){
                let corner = wgs84Helper.Geodetic2Relative(cor_wgs84);
                square.corners.push(corner);
            }
            square.id = square_wgs84.id;
            square.timestamp = square_wgs84.id;
            square.type = square_wgs84.type;

            canvas.draw_square(square);
        }
    }
    this.readJSON = readJSON;
}

export default JSONtoTHREE;