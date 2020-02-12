import Stats from "stats-js"
import JSONtoTHREE from "utils/jsonToThree";
import textFont from 'assets/optimer_regular.typeface.json'
import { Interaction } from 'three.interaction';
import { Color } from "three";

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const OBJLoader = require("three-obj-loader");
let jsonToThree =new JSONtoTHREE();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var clickCoordinate = new THREE.Vector2();
let poi_show = {};
let poi_mesh = {};

let colorTheme = {
    peacewater:{
        backgroud : 0xA5D2F1,
        grid: 0x0677BF,
        clicked: 0xF2808A,
        dashed_line:0x000540,
        solid_line: 0x0015FF,
        pillar: 0x000540,
        lot_border: 0xE5F0FA,
        lot_space: 0x0677BF,
        arrow : 0xDDDDDD,
        text: 0xFFFFFF,
        light: 0xFFFFFF
    },
    peace:{
        backgroud : 0x142601,
        grid: 0xF2F2F2,
        clicked: 0xF2F2F2,
        dashed_line:0x7CEA9C,
        solid_line: 0x2EC4B6,
        pillar: 0xF20505,
        lot_border: 0xE5F0FA,
        lot_space: 0x597320,

        arrow : 0xDDDDDD,
        text: 0xFFFFFF,
        light: 0xF0F0F0
    },
    yicheng: {
        background: 0x081624,
        grid: 0xFFFFFF,
        clicked: 0xFF0000,
        dashed_line: 0xFFFFFF,
        solid_line: 0x215366,
        pillar : 0xB7B7B7,
        lot_border:0xB0B0C0,
        lot_space : 0x081624,
        arrow : 0xFFFFFF,
        text : 0xFFFFFF,
        light: 0xF0F0F0,
        road_border_physical: 0x99CC33,
        highway: 0xFFCC33,
        no_parking_zone: 0xDC143C,
        human_access: 0x00FFFF
    }
    

}
let theme =colorTheme.yicheng;

OBJLoader(THREE);

var scene;
var camera;
var control;
var renderer;
var gridHelper;
let stats;
let map = require("assets/tile.json");

/********** THREE Utils **********/
function dispose_obj(obj) {
    if(obj.parent){
        obj.parent.remove(obj);
    }

    if(obj.geometry){
        obj.geometry.dispose();
    }
    if(obj.material){
        obj.material.dispose();
    }
    obj = undefined;
}

function reload(newMap){
    lots.forEach(obj => {
        dispose_obj(obj);
    })
    lots.length = 0;

    lanes.forEach(obj => {
        dispose_obj(obj);
    })
    lanes.length = 0;

    pillar.forEach(obj =>{
        dispose_obj(obj);
    })
    pillar.length = 0;

    jsonToThree.readJSON(newMap);
}

function init_three(SCREEN_WIDTH, SCREEN_HEIGHT) {
    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 2000);
    camera.position.set(0,0,50);
    camera.up.set(0, 0, 1);
    window.camera = camera;

    // render
    renderer = new THREE.WebGLRenderer({ antialias: true, });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(theme.backgroud, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    scene.add(new THREE.AmbientLight(theme.light));

    // grid
    var grid_width = 300;
    gridHelper = new THREE.GridHelper(grid_width, grid_width, theme.grid, theme.grid);
    gridHelper.rotation.x = Math.PI / 2;
 
    gridHelper.position.z = 6.9; //TODO
    gridHelper.traverse(function(child) {
        child.material.transparent = true;
        child.material.opacity = 0.2;
    })

    scene.add(gridHelper);

    // control
    control = new OrbitControls(camera, renderer.domElement);
    control.target.set(0, 0, 1);
    control.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    control.dampingFactor = 0.25;
    control.rotateSpeed = 0.15;
    control.zoomSpeed = 0.9;
    control.update();

    camera.position.set(0, 0, 50);
    control.target.set(0, 0, 1);
}

function initialize(canvasContainerId, SCREEN_WIDTH, SCREEN_HEIGHT) {
    let devicePixelRatio = window.devicePixelRatio || 1;
    init_three(SCREEN_WIDTH, SCREEN_HEIGHT);
    const interaction = new Interaction(renderer, scene, camera);

    stats = new Stats();
    stats.dom.style.left = "";
    stats.dom.style.top = "";
    stats.dom.style.right = "25px";
    stats.dom.style.bottom = "25px";
    stats.dom.className = "statsPanel"
    document.body.appendChild( stats.dom );
    
    function animate() {
        requestAnimationFrame(animate);
        stats.begin();
    
        control.update();
        renderer.render(scene, camera);        
        stats.end();
    }

    animate();

    var canvasContainer = document.getElementById(canvasContainerId);
    renderer.domElement.className = "main-canvas";
    renderer.domElement.width = SCREEN_WIDTH * devicePixelRatio;
    renderer.domElement.height = SCREEN_HEIGHT * devicePixelRatio;
    canvasContainer.appendChild(renderer.domElement);
    window.addEventListener( 'resize', onWindowResize, false );

    //Render the map content
    jsonToThree.readJSON(map);
    console.log("initialized!");
}


/***************Events ****************/
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onClickEvent(event){
    if (event.intersects.length > 0){
        clickCoordinate = event.intersects[0].point;
    }

    //toggle
    if (this.material.color.equals( new THREE.Color( theme.clicked ))){
        this.material.color.setHex( this.colorType );

        var selectedInfo = scene.getObjectByName(this.childName);
        scene.remove( selectedInfo );
    }
    else{
        this.material.color.setHex(theme.clicked);
        let vertice = new THREE.Vector3(0,0,0);
        let infoText = gen_text(vertice,this.childName+"",vertice, theme.text);
        infoText.name=this.childName;

        infoText.position.x = clickCoordinate.x;
        infoText.position.y = clickCoordinate.y;
        infoText.position.z = this.position.z + this.geometry.vertices[0].z;
        
        scene.add(infoText);
    }

}

/********* DRAW Basic Meshes *********/
let texts = [];
function gen_text(vertice, text, offset, colorName,size = 0.5) {

    var geometry = new THREE.TextGeometry(text, {
        font: new THREE.Font(textFont),
        size: size,
        height: 0,
        curveSegments: 0.001,
        bevelEnabled: false,
    });

    var material = new THREE.MeshBasicMaterial({ color: colorName });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = vertice.x + offset[0];
    mesh.position.y = vertice.y + offset[1];
    mesh.position.z = vertice.z+4;

    texts.push(mesh);

    return mesh;
}

function gen_ribbon(vertices, width, colorName) {

    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial({ color: colorName, side: THREE.DoubleSide });

    for (let index = 0; index < vertices.length - 1; index++) {
        const v_cur = vertices[index];
        const v_next = vertices[index + 1];
        var dx = v_next.x - v_cur.x;
        var dy = v_next.y - v_cur.y;
        var dl = Math.sqrt(dx * dx + dy * dy);
        dx = dx / dl * width;
        dy = dy / dl * width;
        geometry.vertices.push(new THREE.Vector3(v_cur.x - dy, v_cur.y + dx, v_cur.z));
        geometry.vertices.push(new THREE.Vector3(v_cur.x + dy, v_cur.y - dx, v_cur.z));
        geometry.vertices.push(new THREE.Vector3(v_next.x - dy, v_next.y + dx, v_next.z));
        geometry.vertices.push(new THREE.Vector3(v_next.x + dy, v_next.y - dx, v_next.z));
    }

    for (let index = 0; index < (vertices.length - 1) * 2 - 1; index++) {
        geometry.faces.push(new THREE.Face3(index * 2, index * 2 + 1, index * 2 + 2));
        geometry.faces.push(new THREE.Face3(index * 2 + 1, index * 2 + 3, index * 2 + 2));
    }

    geometry.computeFaceNormals();
    var line = new THREE.Mesh(geometry, material);
    return line;
}

function gen_polygon(vertices, colorName, borderColor) {
    var shape = new THREE.Shape();
    var cnt = 0;
    vertices.forEach(v => {
        if (cnt > 0) {
            shape.lineTo(v.x, v.y);
        } else {
            shape.moveTo(v.x, v.y);
        }
        cnt += 1;
    });

    var geometry = new THREE.ShapeGeometry(shape);
    var material = new THREE.MeshBasicMaterial({ color: colorName, side: THREE.DoubleSide});
    var poly = new THREE.Mesh(geometry, material);
    poly.position.z = vertices[0].z;

    if (borderColor) {
        var border = vertices.map((element) => {
            return { x: element.x, y: element.y, z: 0.01 }
        })
        border.push(border[0]); //Five Vertices

        poly.add(gen_ribbon(border, 0.1, borderColor));
    }

    return poly;
}

/********* DRAW LINES *********/
// let lanes = []
function draw_lanes(msg){
    let pts = msg.pts;
    var obj;
    switch (msg.style){
        case "dashed_line":
            var colorName = theme.dashed_line;
            obj = gen_dashed_line(pts, colorName,1.5);
            obj.colorType = colorName;
            break;
        case "solid_line": 
            var colorName = theme.solid_line;
            obj = gen_line(pts, colorName);
            obj.colorType = colorName;
            break;
        case "road_border_physical":
            var colorName = theme.road_border_physical;
            obj = gen_line(pts, colorName);
            obj.colorType = colorName;
            break;
        case "highway":
            var colorName = theme.highway;
            obj = gen_line(pts, colorName);
            obj.colorType = colorName;
            break;
        default: 
            console.log("undefined line type: ", msg.style);
            break;
    }

    obj.childName = msg.id;
    obj.cursor = "pointer";
    obj.on('mousedown', onClickEvent.bind(obj));

    if (! msg.type in poi_mesh){
        poi_mesh[msg.type] = [];
    }

    poi_mesh[msg.type].push(obj);
    //lanes.push(obj);
    scene.add(obj);
}

function gen_dashed_line(vertices,colorName,lineWidth = 2){
    var geometry = new THREE.Geometry();
    var material = new THREE.LineDashedMaterial({ 
        color: colorName, 
        linewidth: lineWidth,
        dashSize: 1,
        gapSize: 1, });
    vertices.forEach(element => {
        geometry.vertices.push(new THREE.Vector3(element.x, element.y, element.z));
    })
    var line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
}

function gen_line(vertices, colorName,lineWidth = 100) {
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({ color: colorName, linewidth: lineWidth });
    vertices.forEach(element => {
        geometry.vertices.push(new THREE.Vector3(element.x, element.y, element.z));
    })

    var line = new THREE.Line(geometry, material);

    return line;
}

function gen_arrow(from, to, colorName, headWidth = 1){
    var dir = new THREE.Vector3( to.x-from.x, to.y-from.y, to.z - from.z);
    dir.normalize();
    var origin = new THREE.Vector3( from.x, from.y, from.z );
    var length = Math.sqrt((to.x-from.x)*(to.x-from.x) + (to.y-from.y)*(to.y-from.y));
    var arrowHelper = new THREE.ArrowHelper( dir, origin, length, colorName, headWidth);
    return arrowHelper;
}

/********* DRAW Cubic Meshes *********/
function draw_cube(msg){
    let corners = msg.corners;
    var obj;
    var shape = new THREE.Shape();
    shape.moveTo( corners[0].x,corners[0].y);
    shape.lineTo( corners[1].x,corners[1].y);
    shape.lineTo( corners[2].x,corners[2].y);
    shape.lineTo( corners[3].x,corners[3].y);
    shape.lineTo( corners[0].x,corners[0].y);

    var extrudeSettings = {
        bevelEnabled: false
    };
    var geometry;
    var material;
    switch (msg.type){
        case "garage_exit": 
            extrudeSettings.steps = 2;
            extrudeSettings.depth = 1;
            geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
            material = new THREE.MeshBasicMaterial( { color: theme.pillar,transparent:true,opacity:0.5 } );
            obj = new THREE.Mesh( geometry, material ) ;
            obj.colorType= theme.pillar;
            break;
        case "speed_bump": 
            extrudeSettings.steps = 2;
            extrudeSettings.depth = 1;
            geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
            material = new THREE.MeshBasicMaterial( { color: theme.bump,transparent:true,opacity:0.5 } );
            obj = new THREE.Mesh( geometry, material ) ;
            obj.colorType= theme.bump;
            break;
        case "garage_entrance": 
            extrudeSettings.steps = 2;
            extrudeSettings.depth = 1;
            geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
            material = new THREE.MeshBasicMaterial( { color: theme.entrance,transparent:true,opacity:0.5 } );
            obj = new THREE.Mesh( geometry, material ) ;
            obj.colorType= theme.entrance;
            break;
        case "pillar": 
            extrudeSettings.steps = 2;
            extrudeSettings.depth = 5;
            geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
            material = new THREE.MeshBasicMaterial( { color: theme.pillar,transparent:true,opacity:0.5 } );
            obj = new THREE.Mesh( geometry, material ) ;
            obj.colorType= theme.pillar;
            break;
        default: obj = null; console.log("undefined cube: ", msg.type); break;
    }
    
    obj.childName = msg.id;
    obj.cursor = "pointer";
    obj.position.z = corners[0].z;

    obj.on('mousedown', onClickEvent.bind(obj));

    if (! msg.type in poi_mesh){
        poi_mesh[msg.type] = [];
    }
    poi_mesh[msg.type].push(obj);
    scene.add( obj );
}

/********* DRAW SQUARES ******/
function draw_square(msg){
    let id = msg.id;
    let pointsArray=msg.corners;
    let type = msg.type;
    let obj;
    let colorName;
    let borderColor;

    if (type == "no_parking_zone"){
        colorName = theme.no_parking_zone;
        obj = gen_polygon(pointsArray, colorName, borderColor);
    }
    else if (type == "human_access"){
        colorName = theme.human_access;
        obj = gen_polygon(pointsArray, colorName, borderColor);
    }
    obj.userData.id = id;
    obj.userData.points = pointsArray;
    obj.userData.type = type;
    
    if (!type in poi_mesh){
        poi_mesh[type] = [];
    }
    poi_mesh[type].push(obj);
    scene.add(obj)
}


/********* DRAW LOTS *********/
//let lots = []
function draw_lots(msg, wrong){
    let id = msg.id;
    //lots_store[id] = msg;
    let pointsArray=msg.corners;

    let colorName = theme.lot_space;
    if (wrong){
        colorName = "#FF0000";
    }

    // let vertice = new THREE.Vector3((point0.x+point1.x)/2,(point0.y+point1.y)/2,point0.z);
     let vertice = new THREE.Vector3(0,0,0);
     let text = gen_text(vertice,id+"",vertice,theme.text);
     text.position.x = (pointsArray[0].x + pointsArray[1].x+pointsArray[2].x+pointsArray[3].x)/4;
     text.position.y = (pointsArray[0].y + pointsArray[1].y+pointsArray[2].y+pointsArray[3].y)/4;
     text.position.z = 1;
     var borderColor = theme.lot_border;
     //parkingPlotID.add(id);
     let cpt = msg.cpos;
     let ept = msg.epos;
     let type = msg.type;

     let arrow = gen_arrow(cpt, ept, theme.arrow);
     arrow.position.z = 0.5;

     let obj = gen_polygon(pointsArray, colorName, borderColor);

     obj.add(text);
     obj.add(arrow);

     obj.userData.ns="lot";
     obj.userData.id = id;
     obj.userData.points = pointsArray;
     obj.userData.cpt = cpt;
     obj.userData.type = type;
     //lots.push(obj);
     if (!type in poi_mesh){
         poi_mesh[type] = [];
     }
     poi_mesh[type].push(obj);
     scene.add(obj)
}

/*********** TOGGLE POI SWITCH *********/

function togglePOI(poiName){
    poi_show.poiName = ! poi_show.poiName;
    poi_mesh.poiName.map(mesh =>{
        //显示
        if (poi_show.poiName){
            
        }
        //隐藏
        else{

        }
    })
}

export {
    initialize,
    draw_lanes,
    draw_lots,
    reload,
    togglePOI,
    draw_cube,
    draw_square
}