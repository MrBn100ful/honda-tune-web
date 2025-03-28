import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface FuelMap3DProps {
  mapData: number[][];
  rpm: number[];
  load: number[];
}

const FuelMap3D = ({ mapData, rpm, load }: FuelMap3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background
    sceneRef.current = scene;

    // Camera setup with better initial position
    const camera = new THREE.PerspectiveCamera(
      60, // Reduced FOV for better perspective
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 3, 3); // Adjusted initial position
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup with improved settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 2; // Minimum zoom distance
    controls.maxDistance = 10; // Maximum zoom distance
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
    controls.minPolarAngle = 0; // Prevent going below the surface
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Create geometry
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add a second directional light for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Animation loop with improved performance
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update mesh when data changes
  useEffect(() => {
    if (!meshRef.current || !mapData.length || !rpm.length || !load.length) return;

    const rows = mapData.length;
    const cols = mapData[0].length;

    // Create vertices with improved scaling
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Normalize data for visualization
    const maxValue = Math.max(...mapData.flat());
    const minValue = Math.min(...mapData.flat());

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (j / (cols - 1)) * 2 - 1;
        const y = (i / (rows - 1)) * 2 - 1;
        const z = ((mapData[i][j] - minValue) / (maxValue - minValue)) * 1.5; // Reduced height for better visualization

        vertices.push(x, y, z);

        // Improved color mapping
        const normalizedValue = (mapData[i][j] - minValue) / (maxValue - minValue);
        const color = new THREE.Color();
        color.setHSL(normalizedValue * 0.3, 1, 0.5); // Adjusted hue range for better color distribution
        colors.push(color.r, color.g, color.b);

        // Create triangles
        if (i < rows - 1 && j < cols - 1) {
          const a = i * cols + j;
          const b = a + 1;
          const c = a + cols;
          const d = c + 1;

          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }

    // Update geometry with improved attributes
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Update material with solid faces
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 30,
      flatShading: true,
      specular: new THREE.Color(0x444444)
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
  }, [mapData, rpm, load]);

  // Handle window resize with improved performance
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-honda-dark rounded-lg overflow-hidden">
    </div>
  );
};

export default FuelMap3D; 