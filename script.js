/**
 * ============================================================
 * FILE: js/script.js
 * DESCRIPTION: Three.js 3D canvas logic for the Landing Page.
 *   Loads three GLB models (sample, hoodie, pant), sets up
 *   studio lighting, scroll-linked animations, raycaster
 *   hover interactions, and manual drag rotation.
 *
 * DEPENDENCIES:
 *   - Three.js (loaded via import map in index.html)
 *   - GLB assets in assets/ folder
 *   - Only active on index.html (Landing Page)
 *
 * BACKEND PLACEHOLDERS: None — purely visual/interactive.
 * ============================================================
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup for index.html canvas
document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('canvas-container');
    if (!mount) return; // Only run on Landing page

    let externalLightIntensity = 40;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null; 
    scene.fog = new THREE.Fog(0x0a0a0a, 15, 60);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    camera.position.set(0, 1.4, 5.2);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // @ts-ignore
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // @ts-ignore
    renderer.physicallyCorrectLights = true;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.domElement.style.background = 'transparent';
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const spotLight = new THREE.SpotLight(0xffffff, 45); 
    spotLight.position.set(10, 10, 10); 
    spotLight.angle = Math.PI / 8;      
    spotLight.penumbra = 0.5;           
    spotLight.decay = 2;                
    spotLight.distance = 100;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.radius = 10;
    scene.add(spotLight);
    scene.add(spotLight.target); 

    const rimLight = new THREE.SpotLight(0xffffff, 30); 
    rimLight.position.set(10, 10, 10);
    rimLight.angle = Math.PI / 16;      
    rimLight.penumbra = 0.8;
    scene.add(rimLight);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.ShadowMaterial({ opacity: 0 }) 
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    plane.receiveShadow = true;
    scene.add(plane);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.target.set(0, 0.8, 0);

    const cursorLight = new THREE.SpotLight(0xffffff, 0); 
    cursorLight.angle = Math.PI / 10;
    cursorLight.penumbra = 0.5;
    cursorLight.distance = 20;
    scene.add(cursorLight);
    scene.add(cursorLight.target);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const floatGroup = new THREE.Group();
    scene.add(floatGroup);
    let mixer = null;
    let modelLoaded = false;

    loader.load('/assets/sample.glb', (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.8 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += size.y * scale * 0.25;

        const feetY = model.position.y - size.y * scale * 0.5;
        plane.position.y = feetY;

        spotLight.target.position.set(0, model.position.y, 0);
        spotLight.target.updateMatrixWorld();

        rimLight.target.position.set(0, model.position.y, 0);
        rimLight.target.updateMatrixWorld();

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                if (child.material) {
                    child.material.roughness = 0.6;
                    child.material.metalness = 0.1;
                }
            }
        });

        floatGroup.add(model);
        modelLoaded = true;

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((c) => mixer.clipAction(c).play());
        }
    });

    const floatGroup2 = new THREE.Group();
    scene.add(floatGroup2);
    let model2Loaded = false;

    loader.load('/assets/hoodie.glb', (gltf) => {
        const model2 = gltf.scene;
        const box = new THREE.Box3().setFromObject(model2);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.8 / maxDim;

        model2.scale.setScalar(scale);
        model2.position.sub(center.multiplyScalar(scale));
        model2.position.y += size.y * scale * 0.25;

        model2.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                if (child.material) {
                    child.material.transparent = true;
                    child.material.depthWrite = false;
                    child.material.opacity = 0; 
                    child.material.roughness = 0.6;
                    child.material.metalness = 0.1;
                }
            }
        });

        floatGroup2.add(model2);
        model2Loaded = true;
    });

    const floatGroup3 = new THREE.Group();
    scene.add(floatGroup3);
    let model3Loaded = false;

    loader.load('/assets/pant.glb', (gltf) => {
        const model3 = gltf.scene;
        const box = new THREE.Box3().setFromObject(model3);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.8 / maxDim;

        model3.scale.setScalar(scale);
        model3.position.sub(center.multiplyScalar(scale));
        model3.position.y += size.y * scale * 0.25;

        model3.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                if (child.material) {
                    child.material.transparent = true;
                    child.material.depthWrite = false;
                    child.material.opacity = 0; 
                    child.material.roughness = 0.6;
                    child.material.metalness = 0.1;
                }
            }
        });

        floatGroup3.add(model3);
        model3Loaded = true;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1, -1);

    let isDragging = false;
    const previousMouse = new THREE.Vector2();
    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);

    const onMouseMove = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
            const deltaX = event.clientX - previousMouse.x;
            const deltaY = event.clientY - previousMouse.y;

            targetRotation.y += deltaX * 0.005;
            targetRotation.x += deltaY * 0.005;

            previousMouse.set(event.clientX, event.clientY);
        }
    };

    const onMouseDown = (event) => {
        const target = event.target;
        if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.closest('.user-profile')) {
            return;
        }

        isDragging = true;
        previousMouse.set(event.clientX, event.clientY);
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Interactive Hover for Lights
    const loginBtn = document.getElementById('login-btn');
    const startDripBtn = document.getElementById('start-drip-btn');
    
    const onBtnHover = () => externalLightIntensity = 120;
    const onBtnLeave = () => externalLightIntensity = 40;

    if(loginBtn) {
        loginBtn.addEventListener('mouseenter', onBtnHover);
        loginBtn.addEventListener('mouseleave', onBtnLeave);
    }
    if(startDripBtn) {
        startDripBtn.addEventListener('mouseenter', onBtnHover);
        startDripBtn.addEventListener('mouseleave', onBtnLeave);
    }

    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.elapsedTime;

        const scrollSection = window.scrollY / window.innerHeight;
        const stage1 = THREE.MathUtils.clamp(scrollSection, 0, 1);
        const stage2 = THREE.MathUtils.clamp(scrollSection - 1, 0, 1);

        let shadowOp = THREE.MathUtils.clamp(stage1 * (0.4 / 0.3), 0, 0.4);
        plane.material.opacity = shadowOp;

        if (spotLight) {
            spotLight.intensity = THREE.MathUtils.lerp(
                spotLight.intensity,
                externalLightIntensity,
                0.08
            );
        }

        if (modelLoaded || model2Loaded) {
            raycaster.setFromCamera(mouse, camera);
            const interactables = [];

            if (modelLoaded) interactables.push(floatGroup);
            if (model2Loaded && scrollSection > 0.1) interactables.push(floatGroup2);
            if (model3Loaded && scrollSection > 1.1) interactables.push(floatGroup3);

            const intersects = raycaster.intersectObjects(interactables, true);

            if (intersects.length > 0) {
                document.body.style.cursor = 'pointer';
                const point = intersects[0].point;

                cursorLight.intensity = THREE.MathUtils.lerp(cursorLight.intensity, 80, 0.1);
                cursorLight.position.set(camera.position.x, camera.position.y, camera.position.z);
                cursorLight.target.position.lerp(point, 0.2);

                if (!isDragging) {
                    targetRotation.x = THREE.MathUtils.lerp(targetRotation.x, -mouse.y * 0.4, 0.1);
                    targetRotation.y = THREE.MathUtils.lerp(targetRotation.y, mouse.x * 0.4, 0.1);
                }
            } else {
                document.body.style.cursor = 'default';
                cursorLight.intensity = THREE.MathUtils.lerp(cursorLight.intensity, 0, 0.1);

                if (!isDragging) {
                    targetRotation.x = THREE.MathUtils.lerp(targetRotation.x, 0, 0.05);
                    targetRotation.y = THREE.MathUtils.lerp(targetRotation.y, 0, 0.05);
                }
            }

            currentRotation.x = THREE.MathUtils.lerp(currentRotation.x, targetRotation.x, 0.08);
            currentRotation.y = THREE.MathUtils.lerp(currentRotation.y, targetRotation.y, 0.08);

            const scrollRotationY = stage1 * Math.PI * 2; 

            const finalRotationX = currentRotation.x;
            const finalRotationY = currentRotation.y + scrollRotationY;

            const baseFloatY = Math.sin(elapsed * 0.55) * 0.055;
            const baseZRot = Math.sin(elapsed * 0.38) * 0.010;

            if (modelLoaded) {
                const targetScale1 = THREE.MathUtils.lerp(1.0, 0.75, stage1);
                let targetX1 = THREE.MathUtils.lerp(0, 1.5, stage1);
                targetX1 = THREE.MathUtils.lerp(targetX1, 3.0, stage2);
                const targetZRot1 = THREE.MathUtils.lerp(baseZRot, -0.15, stage1);

                floatGroup.scale.setScalar(THREE.MathUtils.lerp(floatGroup.scale.x, targetScale1, 0.08));
                floatGroup.position.x = THREE.MathUtils.lerp(floatGroup.position.x, targetX1, 0.08);
                floatGroup.position.y = baseFloatY;
                floatGroup.rotation.x = finalRotationX;
                floatGroup.rotation.y = finalRotationY;
                floatGroup.rotation.z = THREE.MathUtils.lerp(floatGroup.rotation.z, targetZRot1, 0.08);
            }

            if (model2Loaded) {
                floatGroup2.visible = true;
                let targetX2 = THREE.MathUtils.lerp(0, -1.6, stage1);
                targetX2 = THREE.MathUtils.lerp(targetX2, 1.5, stage2);
                let targetScale2In = THREE.MathUtils.lerp(2.0, 1.0, stage1);
                targetScale2In = THREE.MathUtils.lerp(targetScale2In, 0.75, stage2);

                floatGroup2.scale.setScalar(THREE.MathUtils.lerp(floatGroup2.scale.x, targetScale2In, 0.08));
                floatGroup2.position.x = THREE.MathUtils.lerp(floatGroup2.position.x, targetX2, 0.08);
                floatGroup2.position.y = baseFloatY * 0.8 + 0.1; 
                floatGroup2.position.z = -1;

                const hoodieStage2Spin = stage2 * Math.PI * 2;
                floatGroup2.rotation.x = finalRotationX;
                floatGroup2.rotation.y = finalRotationY + hoodieStage2Spin;

                if (floatGroup2.children[0]) {
                    floatGroup2.children[0].traverse((child) => {
                        if (child.isMesh && child.material) {
                            const targetOpacity = THREE.MathUtils.clamp(stage1 * 3, 0, 1);
                            child.material.opacity = targetOpacity;
                            child.material.transparent = targetOpacity < 0.99;
                            child.material.depthWrite = targetOpacity >= 0.99;
                        }
                    });
                }
            }

            if (model3Loaded) {
                floatGroup3.visible = true;
                const targetX3 = THREE.MathUtils.lerp(0, -1.6, stage2);
                const targetScale3In = THREE.MathUtils.lerp(2.0, 1.0, stage2);

                floatGroup3.scale.setScalar(THREE.MathUtils.lerp(floatGroup3.scale.x, targetScale3In, 0.08));
                floatGroup3.position.x = THREE.MathUtils.lerp(floatGroup3.position.x, targetX3, 0.08);
                floatGroup3.position.y = baseFloatY * 0.8 - 0.3; 
                floatGroup3.position.z = -1;

                floatGroup3.rotation.x = finalRotationX;
                floatGroup3.rotation.y = finalRotationY;

                if (floatGroup3.children[0]) {
                    floatGroup3.children[0].traverse((child) => {
                        if (child.isMesh && child.material) {
                            const targetOpacity = THREE.MathUtils.clamp(stage2 * 3, 0, 1);
                            child.material.opacity = targetOpacity;
                            child.material.transparent = targetOpacity < 0.99;
                            child.material.depthWrite = targetOpacity >= 0.99;
                        }
                    });
                }
            }
        }
        if (mixer && modelLoaded) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
});
