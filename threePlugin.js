let scene, camer, renderer, stat;
let width = 1000;
let height = 1000;

function init(){
    //Load the stats module
    stat = new Stats();
    stat.domElement.style.position = 'absolute';
    stat.domElement.style.right = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);
    
    //canvas
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('mainCanvas')
    });

    //scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(45, width/height,0,1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    //light
    var light = new THREE.SpotLight(0xffffff);
    light.position.set(0, 0, 0);
    scene.add(light);

    //Add components
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(500,500),
        new THREE.MeshBasicMaterial({
            color: 0xff0000, 
            //side: THREE.DoubleSide, 
            opacity: 0.5
        }
    ));
    scene.add(plane);
    
    var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    cube.position.x = 2;
    cube.castShadow = true;
    scene.add(cube);

    renderer.render(scene,camera);
}



