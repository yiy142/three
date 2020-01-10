import Stats from "stats-js"
import JSONtoTHREE from "./jsonToThree";
import textFont from 'assets/optimer_regular.typeface.json'

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const OBJLoader = require("three-obj-loader");
let jsonToThree =new JSONtoTHREE();

OBJLoader(THREE);

var scene;
var camera;
var control;
var renderer;
var gridHelper;
let stats;

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
    renderer.setClearColor(0x081624, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    scene.add(new THREE.AmbientLight(0xF0F0F0));

    // grid
    var grid_width = 300;
    gridHelper = new THREE.GridHelper(grid_width, grid_width, 0xFFFFFF, 0xFFFFFF);
    gridHelper.rotation.x = Math.PI / 2;
 
    gridHelper.position.z = 6.9;
    gridHelper.traverse(function(child) {
        child.material.transparent = true;
        child.material.opacity = 0.2;
    })
    scene.add(gridHelper);
    window.gridUp = (value = 0.3)=>{
        gridHelper.position.z += value;
    }
    window.gridDown = (value = 0.3)=>{
        gridHelper.position.z -= value;
    }

    // control
    control = new OrbitControls(camera, renderer.domElement);
    control.target.set(0, 0, 1);
    control.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    control.dampingFactor = 0.25;
    control.rotateSpeed = 0.15;
    control.zoomSpeed = 0.9;
    control.update();

    scene.add(new THREE.AxesHelper(5));

    camera.position.set(0, 0, 50);
    control.target.set(0, 0, 1);
}



function initialize(canvasContainerId, SCREEN_WIDTH, SCREEN_HEIGHT) {
    let devicePixelRatio = window.devicePixelRatio || 1;
    init_three(SCREEN_WIDTH, SCREEN_HEIGHT);
    stats = new Stats();
    stats.dom.style.top = "25px";
    stats.dom.style.left = "25px";
    stats.dom.className = "statsPanel"
    document.body.appendChild( stats.dom );

    function animate() {
        // fixed update
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

    jsonToThree.readJSON('assets/tile');
}

// function clearMap(){
//     remove_objects(lots);
//     remove_objects(lanes);
//     remove_objects(pillar);
// }

// function remove_objects(objects) {
//     objects.forEach(obj => {
//         dispose_obj(obj);
//     })
//     objects.length = 0;
//     lots_store = new Object();
// }

/********* DRAW Basic Meshes *********/

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
    var material = new THREE.MeshBasicMaterial({ color: colorName, side: THREE.DoubleSide });
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
let lanes = []
function draw_lanes(msg){
   // if(car_loading) return;
    let pts = msg.pts;
    var obj;
    var id = new Date().getTime();
    if(msg.style == "dashed_line"){
        var colorName = 0xFFFFFF;
        obj = gen_dashed_line(pts, colorName,1.5);
    }else{
        var colorName = 0x215366;
        obj = gen_line(pts, colorName);
    }
   lanes.push(obj);
   scene.add(obj)
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

function gen_line(vertices, colorName,lineWidth = 2) {
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({ color: colorName, linewidth: lineWidth });
    vertices.forEach(element => {
        geometry.vertices.push(new THREE.Vector3(element.x, element.y, element.z));
    })

    var line = new THREE.Line(geometry, material);

    return line;
}

/********* DRAW PILLARS *********/
let pillar = []
function draw_pillar(msg){
    let corners = msg.corners;
    var shape = new THREE.Shape();
    shape.moveTo( corners[0].x,corners[0].y);
    shape.lineTo( corners[1].x,corners[1].y);
    shape.lineTo( corners[2].x,corners[2].y);
    shape.lineTo( corners[3].x,corners[3].y);
    shape.lineTo( corners[0].x,corners[0].y);
    var extrudeSettings = {
        steps: 2,
        depth: 5,
        bevelEnabled: false
    };
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    var material = new THREE.MeshBasicMaterial( { color: `#B7B7B7`,transparent:true,opacity:0.5 } );
    var mesh = new THREE.Mesh( geometry, material ) ;
    mesh.position.z = corners[0].z;
    scene.add( mesh );
    pillar.push(mesh)
}

/********* DRAW LOTS *********/
let lots = []
function draw_lots(msg){
    let id = msg.id;
    //lots_store[id] = msg;
    let pointsArray=msg.corners;

     let checkedColor = "#6387A6";  
     let occupiedColor = "#A7C6D9";
     let selectedColor = "#30A5FF";
     let colorName = "#081624";

    // let vertice = new THREE.Vector3((point0.x+point1.x)/2,(point0.y+point1.y)/2,point0.z);
     let vertice = new THREE.Vector3(0,0,0);
     let text = gen_text(vertice,id+"",vertice,"#FFFFFF");
     text.position.x = (pointsArray[0].x + pointsArray[1].x+pointsArray[2].x+pointsArray[3].x)/4;
     text.position.y = (pointsArray[0].y + pointsArray[1].y+pointsArray[2].y+pointsArray[3].y)/4;
     text.position.z = 1;
     var borderColor = 0xB0B0C0;
     //parkingPlotID.add(id);
     let cpt = msg.cpos;
     let ept = msg.epos;
  
     let obj = gen_polygon(pointsArray, colorName, borderColor);
     obj.add(text);
     obj.userData.ns="lot";
     obj.userData.id = id;
     obj.userData.points = pointsArray;
     obj.userData.cpt = cpt;
     lots.push(obj);
     scene.add(obj)
}
export {
    initialize,
    draw_lanes,
    draw_pillar,
    draw_lots
}