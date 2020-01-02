var requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var scene = null;
var camera = null;
var renderer = null;

var id = null;
var stat = null;

var ballMesh = null;
var ballRadius = 0.5;
var isMoving = false;
var maxHeight = 5;

var v = 0;
var a = -0.01;

function init() {
    stat = new Stats();
    stat.domElement.style.position = 'absolute';
    stat.domElement.style.right = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('mainCanvas')
    });
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-5, 5, 3.75, -3.75, 0.1, 100);
    camera.position.set(5, 10, 20);
    camera.lookAt(new THREE.Vector3(0, 3, 0));
    scene.add(camera);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8, 16, 16),
        new THREE.MeshLambertMaterial({ color: 0xcccccc }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);

    cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    cube.position.x = 2;
    cube.castShadow = true;
    scene.add(cube);

    var light = new THREE.SpotLight(0xffff00, 1, 100, Math.PI / 6, 25);
    light.position.set(2, 5, 3);
    light.target = cube;
    light.castShadow = true;

    light.shadowCameraNear = 2;
    light.shadowCameraFar = 10;
    light.shadowCameraFov = 30;
    light.shadowCameraVisible = true;

    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    light.shadowDarkness = 0.3;

    scene.add(light);

    renderer.render();
}

function draw() {
    stat.begin();

    if (isMoving) {
        ballMesh.position.y += v;
        v += a;

        if (ballMesh.position.y <= ballRadius) {
            // hit plane
            v = -v * 0.9;
        }

        if (Math.abs(v) < 0.0001) {
            // stop moving
            isMoving = false;
            ballMesh.position.y = ballRadius;
        }
    }

    renderer.render(scene, camera);

    id = requestAnimationFrame(draw);

    stat.end();
}

function stop() {
    if (id !== null) {
        cancelAnimationFrame(id);
        id = null;
    }
}

function drop() {
    isMoving = true;
    ballMesh.position.y = maxHeight;
    v = 0;
}