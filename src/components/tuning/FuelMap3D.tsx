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

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Create geometry
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
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

    // Create vertices
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
        const z = ((mapData[i][j] - minValue) / (maxValue - minValue)) * 2;

        vertices.push(x, y, z);

        // Color based on value
        const color = new THREE.Color();
        color.setHSL((mapData[i][j] - minValue) / (maxValue - minValue), 1, 0.5);
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

    // Update geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Update material
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
  }, [mapData, rpm, load]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-honda-dark rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 text-honda-light text-sm">
        <div>RPM: X-axis</div>
        <div>Load (mbar): Y-axis</div>
        <div>Injection (ms): Z-axis</div>
      </div>
    </div>
  );
};

export default FuelMap3D; 