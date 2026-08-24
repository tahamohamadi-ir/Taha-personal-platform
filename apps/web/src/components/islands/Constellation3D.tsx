import { useEffect, useRef } from "react";

const NODE_COUNT = 5;

interface OrbitParams {
  radius: number;
  speed: number;
  phase: number;
  incline: number;
}

const ORBITS: OrbitParams[] = [
  { radius: 1.7, speed: 0.32, phase: 0.0, incline: 0.3 },
  { radius: 2.05, speed: -0.26, phase: 1.35, incline: -0.42 },
  { radius: 2.35, speed: 0.21, phase: 2.7, incline: 0.22 },
  { radius: 2.0, speed: -0.35, phase: 4.1, incline: -0.26 },
  { radius: 2.5, speed: 0.17, phase: 5.3, incline: 0.38 },
];

const TURQUOISE = 0x16b8a6;
const GOLD = 0xc89b3c;

export default function Constellation3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.innerWidth < 768) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three")
      .then((THREE) => {
        if (disposed || !container.isConnected) return;

        const initialWidth = container.clientWidth || 420;
        const initialHeight = container.clientHeight || initialWidth;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(initialWidth, initialHeight, false);
        renderer.setClearAlpha(0);
        const canvas = renderer.domElement;
        canvas.setAttribute("aria-hidden", "true");
        Object.assign(canvas.style, {
          display: "block",
          width: "100%",
          height: "100%",
        });

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          42,
          initialWidth / initialHeight,
          0.1,
          50,
        );
        camera.position.set(0, 0.6, 7.2);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 1.1));
        const directional = new THREE.DirectionalLight(0xffffff, 1.6);
        directional.position.set(3, 5, 6);
        scene.add(directional);

        const rig = new THREE.Group();
        const spin = new THREE.Group();
        rig.add(spin);
        scene.add(rig);

        const nodeGeometry = new THREE.SphereGeometry(0.15, 20, 14);
        const coreGeometry = new THREE.SphereGeometry(0.52, 28, 20);
        const nodeMaterial = new THREE.MeshStandardMaterial({
          color: TURQUOISE,
          roughness: 0.4,
          metalness: 0.1,
        });
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: GOLD,
          roughness: 0.35,
          metalness: 0.45,
        });
        const spokeMaterial = new THREE.LineBasicMaterial({
          color: TURQUOISE,
          transparent: true,
          opacity: 0.3,
        });
        const ringMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.14,
        });

        const nodes = ORBITS.map((orbit) => {
          const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
          spin.add(mesh);
          return { mesh, orbit };
        });

        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        spin.add(core);

        const spokeGeometry = new THREE.BufferGeometry();
        const spokePositions = new Float32Array(NODE_COUNT * 2 * 3);
        spokeGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(spokePositions, 3),
        );
        const spokes = new THREE.LineSegments(spokeGeometry, spokeMaterial);
        spin.add(spokes);

        const ringGeometry = new THREE.BufferGeometry();
        const ringPositions = new Float32Array((NODE_COUNT + 1) * 3);
        ringGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(ringPositions, 3),
        );
        const ring = new THREE.Line(ringGeometry, ringMaterial);
        spin.add(ring);

        const placeNodes = (time: number): void => {
          for (const { mesh, orbit } of nodes) {
            const angle = orbit.phase + time * orbit.speed;
            mesh.position.set(
              Math.cos(angle) * orbit.radius,
              Math.sin(angle) * orbit.radius * orbit.incline,
              Math.sin(angle) * orbit.radius,
            );
          }
        };

        const updateLinks = (): void => {
          for (let i = 0; i < nodes.length; i++) {
            const p = nodes[i].mesh.position;
            const o = i * 6;
            spokePositions[o] = 0;
            spokePositions[o + 1] = 0;
            spokePositions[o + 2] = 0;
            spokePositions[o + 3] = p.x;
            spokePositions[o + 4] = p.y;
            spokePositions[o + 5] = p.z;
          }
          spokeGeometry.getAttribute("position").needsUpdate = true;
          for (let i = 0; i <= nodes.length; i++) {
            const p = nodes[i % nodes.length].mesh.position;
            ringPositions[i * 3] = p.x;
            ringPositions[i * 3 + 1] = p.y;
            ringPositions[i * 3 + 2] = p.z;
          }
          ringGeometry.getAttribute("position").needsUpdate = true;
        };

        container.appendChild(canvas);

        const parallax = { targetX: 0, targetY: 0, x: 0, y: 0 };
        const onPointerMove = (event: PointerEvent): void => {
          const rect = container.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          parallax.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          parallax.targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        };
        container.addEventListener("pointermove", onPointerMove);

        const resize = (): void => {
          const width = container.clientWidth;
          const height = container.clientHeight;
          if (width === 0 || height === 0) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);

        const clock = new THREE.Clock();
        let raf = 0;
        let elapsed = 0;
        const DAMPING = 4.5;
        const tick = (): void => {
          const delta = Math.min(clock.getDelta(), 0.05);
          elapsed += delta;
          spin.rotation.y += delta * 0.22;
          const blend = 1 - Math.exp(-delta * DAMPING);
          parallax.x += (parallax.targetX * 0.4 - parallax.x) * blend;
          parallax.y += (parallax.targetY * 0.28 - parallax.y) * blend;
          rig.rotation.y = parallax.x;
          rig.rotation.x = parallax.y;
          placeNodes(elapsed);
          updateLinks();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };

        container.dataset.ready = "true";
        resize();
        placeNodes(0);
        updateLinks();
        renderer.render(scene, camera);

        if (!reducedMotion) {
          raf = requestAnimationFrame(tick);
        }

        cleanup = () => {
          cancelAnimationFrame(raf);
          observer.disconnect();
          container.removeEventListener("pointermove", onPointerMove);
          spokeGeometry.dispose();
          ringGeometry.dispose();
          nodeGeometry.dispose();
          coreGeometry.dispose();
          nodeMaterial.dispose();
          coreMaterial.dispose();
          spokeMaterial.dispose();
          ringMaterial.dispose();
          renderer.dispose();
          canvas.remove();
          delete container.dataset.ready;
        };
      })
      .catch(() => {
        // WebGL or module-load failure: keep the static SVG fallback visible.
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="constellation-3d" aria-hidden="true" />;
}
