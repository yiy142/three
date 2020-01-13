import WGS84Helper from "utils/WGS84Helper"
import * as canvas from "utils/canvas.js"
const THREE = require('three');

let JSONtoTHREE = function () {
    let wgs84Helper =new WGS84Helper();

    function readJSON(data){
        let config = data.config;
        window.map_anchor = config.anchor;
        window.map_offset = config.offset;

        let lanes = data.lanes;
        let lots = data.lots;
        let pillars = data.pillar;

        renderLines(lanes);
        renderLots(lots);
        renderPillars(pillars);
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

            canvas.draw_lots(lot);
        }
    }

    function renderPillars(pillars){
        for(let pillarName in pillars){
            let pillar_wgs84 = pillars[pillarName]
            let corners_wgs84 = pillar_wgs84.corners;
            let pillar = {};
            pillar.corners = new Array();
          
            for(let cor_wgs84 of corners_wgs84){
                let corner = wgs84Helper.Geodetic2Relative(cor_wgs84);
                pillar.corners.push(corner);
            }
            pillar.id = pillar_wgs84.id;
            pillar.timestamp = pillar_wgs84.id;
            canvas.draw_pillar(pillar);
        }
    }

    this.readJSON = readJSON;
    
}

export default JSONtoTHREE;