import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const noctaviaLogoLines = `NNNNNNNN        NNNNNNNN
N:::::::N       N::::::N
N::::::::N      N::::::N
N:::::::::N     N::::::N
N::::::::::N    N::::::N
N:::::::::::N   N::::::N
N::::N:::::::N  N::::::N
N::::N N:::::::N N:::::N
N::::N  N:::::::N::::::N
N::::N   N:::::::::::::N
N::::N    N::::::::::::N
N::::N     N:::::::::::N
N::::N      N::::::::::N
N::::N       N:::::::::N
N::::N        N::::::::N
NNNNNN         NNNNNNNN`.split('\n');

const ThreeDScene: React.FC<{ onTransitionEnd: () => void }> = ({ onTransitionEnd }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showDragHint, setShowDragHint] = useState(true);

    const animationState = useRef({
        isZooming: false,
        isLoading: true,
    });

    const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const textureContextRef = useRef<CanvasRenderingContext2D | null>(null);
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const animationIntervalRef = useRef<number | null>(null);

    const handleTransitionEnd = useCallback(onTransitionEnd, [onTransitionEnd]);
    
    useEffect(() => {
        if (!mountRef.current) return;

        animationState.current.isLoading = true;
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0.7, 4);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.4, 0);
        controls.enableDamping = true;
        
        const currentLookAt = new THREE.Vector3(0, 0.4, 0);
        camera.lookAt(controls.target);
        
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 384;
        textureCanvasRef.current = canvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            textureContextRef.current = ctx;
            ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        const screenTexture = new THREE.CanvasTexture(canvas);
        screenTexture.center.set(0.5, 0.5); screenTexture.rotation = -Math.PI / 2;
        textureRef.current = screenTexture;
        
        const spotLight = new THREE.SpotLight(0xffeeb1, 0);
        spotLight.position.set(0.5, 4, 2);
        spotLight.angle = Math.PI / 4; // Wider angle
        spotLight.penumbra = 0.7; // Softer edges
        spotLight.castShadow = true;
        scene.add(spotLight);

        const screenGlowLight = new THREE.PointLight(0xf97316, 0, 3);
        screenGlowLight.position.set(-0.05, 0.45, 0.3); // Positioned in front of the screen
        scene.add(screenGlowLight);
        
        const ground = new THREE.Mesh( new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x000000 }) );
        ground.rotation.x = -Math.PI / 2; ground.position.y = -1; ground.receiveShadow = true;
        scene.add(ground);
        
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            animationState.current.isLoading = false;
            setIsLoading(false);
        };
        loadingManager.onProgress = (_, loaded, total) => setProgress(Math.round((loaded / total) * 100));

        const dracoLoader = new DRACOLoader(loadingManager);
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

        const loader = new GLTFLoader(loadingManager);
        loader.setDRACOLoader(dracoLoader);

        loader.load('https://raw.githubusercontent.com/xshfredx/noctaviaPC/main/commodore_64__computer_full_pack.glb', (gltf) => {
            const model = gltf.scene;
            model.position.y = -1;
            scene.add(model);
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  if (child.name === 'Object_19') {
                      child.material = new THREE.MeshStandardMaterial({
                          map: screenTexture, emissive: 0xf97316, emissiveMap: screenTexture, emissiveIntensity: 1.5,
                      });
                  }
                }
            });
        }, undefined, (error) => console.error('An error happened:', error));

        const onDoubleClick = () => {
            if (animationState.current.isLoading || animationState.current.isZooming) return;
            animationState.current.isZooming = true;
            controls.enabled = false;
            if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        };
        
        const rendererElement = renderer.domElement;
        rendererElement.addEventListener('dblclick', onDoubleClick);
        rendererElement.addEventListener('pointerdown', () => {
             setShowDragHint(false);
        });

        const zoomTargetPosition = new THREE.Vector3(-0.05, 0.45, 0.5);
        const zoomTargetLookAt = new THREE.Vector3(-0.05, 0.45, 0);
        
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();

            if (spotLight.intensity > 0) {
                 if (Math.random() > 0.98) spotLight.intensity = 15 + Math.random() * 15;
                 else if (spotLight.intensity < 50) spotLight.intensity += 1;
                 else spotLight.intensity = 50;
            }

            if (animationState.current.isZooming) {
                camera.position.lerp(zoomTargetPosition, 0.05);
                currentLookAt.lerp(zoomTargetLookAt, 0.05);
                camera.lookAt(currentLookAt);
                const distance = camera.position.distanceTo(zoomTargetPosition);
                if (distance < 0.01) {
                    cancelAnimationFrame(animationFrameId);
                    handleTransitionEnd();
                }
            }
            
            renderer.render(scene, camera);
        };
        animate();
        
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const button = document.createElement('button');
        button.innerText = 'Turn Off Lights';
        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.left = '10px';
        button.style.zIndex = '100';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = 'black';
        button.style.color = '#f97316';
        button.style.border = '2px solid #f97316';
        button.style.cursor = 'pointer';
        button.style.fontFamily = "'VT323', monospace";
        button.style.textTransform = 'uppercase';
        button.style.transition = 'all 0.2s ease';
        button.onmouseover = () => { button.style.backgroundColor = '#f97316'; button.style.color = 'black'; };
        button.onmouseout = () => { button.style.backgroundColor = 'black'; button.style.color = '#f97316'; };
        button.onclick = () => {
            if(spotLight.intensity > 0) {
                spotLight.intensity = 0;
                screenGlowLight.intensity = 2.0;
                button.innerText = 'Turn On Lights';
            } else {
                spotLight.intensity = 50;
                screenGlowLight.intensity = 0;
                button.innerText = 'Turn Off Lights';
            }
        };
        mountRef.current?.appendChild(button);
        spotLight.intensity = 50; // Start with lights on


        return () => {
            rendererElement.removeEventListener('dblclick', onDoubleClick);
            window.removeEventListener('resize', handleResize);
            if(mountRef.current) mountRef.current.innerHTML = '';
            cancelAnimationFrame(animationFrameId);
            if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        };
    }, [handleTransitionEnd]);

    useEffect(() => {
        if (isLoading) return;
        let lineIndex = 0;
        const intervalId = setInterval(() => {
            const ctx = textureContextRef.current, texture = textureRef.current;
            if (!ctx || !texture) return;
            if (lineIndex >= noctaviaLogoLines.length) { clearInterval(intervalId); return; }
            const currentLines = noctaviaLogoLines.slice(0, lineIndex + 1);
            ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#f97316'; ctx.font = '24px "VT323", monospace'; ctx.textAlign = 'center';
            const lineHeight = 24, totalHeight = currentLines.length * lineHeight;
            let startY = (ctx.canvas.height - totalHeight) / 2 + (lineHeight / 2) + 10;
            currentLines.forEach((line, index) => ctx.fillText(line, ctx.canvas.width / 2, startY + (index * lineHeight)));
            texture.needsUpdate = true;
            lineIndex++;
        }, 100);
        animationIntervalRef.current = intervalId as any;
        return () => { if(animationIntervalRef.current) clearInterval(animationIntervalRef.current); }
    }, [isLoading]);

    return (
        <div ref={mountRef} className="w-full h-full relative">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-orange-500 fade-in">
                    <div className="text-center">
                        <p className="text-3xl text-glow">LOADING ASSETS...</p>
                        <p className="text-xl text-glow mt-2">{progress}%</p>
                    </div>
                </div>
            )}
            {!isLoading && showDragHint && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-orange-500 text-xl text-glow fade-in pointer-events-none">
                    Drag to explore
                </div>
            )}
        </div>
    );
};

export default ThreeDScene;