/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-09-20 13:47:27
 * @LastEditTime: 2019-10-17 21:29:27
 * @LastEditors: Please set LastEditors
 */
import proj4 from "proj4"


let WGS84HelperProjection = function(){
    const anchor_default = {x:120.646651,y:31.431136,z:0}
    const offset_default = {x:-1153.2257685419981,y:-972.5683789358485,z:0}
    let anchor = anchor_default;
    let offset = offset_default;

    let latlonProjWkt = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    let tmercProjWkt = `+proj=tmerc +lat_0=${anchor.y} +lon_0=${anchor.x} +axis=enu +k=1 +x_0=0 +y_0=0 +datum=WGS84 +no_defs +geoidgrids=egm96_15.gtx`;


    function Geodetic2Relative(llh) 
    {   
        
        let result = proj4(latlonProjWkt,tmercProjWkt,[llh.x,llh.y]);
        console.log(result);
        let relative = {
            x:result[0] - offset.x,
            y:result[1] - offset.y,
            z:llh.z - offset.z
        }
        return relative;
    }

    function Relative2Geodetic(relative) {
        relative.x += offset.x;
        relative.y += offset.y;
        relative.z += offset.z;
        let result = proj4(latlonProjWkt,tmercProjWkt,[relative.x,relative.y]);
        let llh = {
            x:result[0],
            y:result[1],
            z:relative.z
        };
        return llh;
    }

    this.Geodetic2Relative = Geodetic2Relative;
    this.Relative2Geodetic = Relative2Geodetic;
    this.getOffset = ()=>{
        return offset;
    }
}

export default WGS84HelperProjection;