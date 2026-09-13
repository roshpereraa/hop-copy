import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Scroll keyframes: p is global "mascot progress" (0 = top of hero, 1 = end of story)
// pos / rot (radians) / scale / streak opacity / canvas opacity
const KEYS = [
  { p: 0.00, pos: [2.1, -1.2, 0], rot: [0.05, -0.75, 0.12], s: 1.25, streak: 0, o: 1 },
  { p: 0.10, pos: [0.2, 2.1, -1.5], rot: [0.9, -0.2, 0.1], s: 0.85, streak: 0.4, o: 1 },    // beat 0 – above the headline
  { p: 0.22, pos: [3.1, 0.2, -0.5], rot: [0.5, 0.9, -1.2], s: 0.95, streak: 0.7, o: 1 },    // beat 1 – right side glide
  { p: 0.34, pos: [-3.1, -0.6, 0], rot: [-0.3, 0.3, -1.5], s: 1.0, streak: 0.9, o: 1 },     // beat 2 – left fly-by
  { p: 0.46, pos: [2.9, 1.4, -0.5], rot: [0.4, -0.9, 1.35], s: 0.9, streak: 1, o: 1 },      // beat 3
  { p: 0.58, pos: [-3.0, 1.2, -0.5], rot: [0.2, 0.4, -1.4], s: 0.9, streak: 0.8, o: 1 },    // beat 4
  { p: 0.70, pos: [1.6, 0.2, -1], rot: [0.3, 0.5, -1.55], s: 0.85, streak: 0.5, o: 1 },     // caption L → mascot right
  { p: 0.80, pos: [-1.8, 0.3, -1.5], rot: [0.2, -0.4, 1.5], s: 0.8, streak: 0.3, o: 1 },    // caption R → mascot left
  { p: 0.90, pos: [2.0, 0.9, -2], rot: [0.1, 0.6, -1.5], s: 0.6, streak: 0.1, o: 1 },       // caption L low
  { p: 1.00, pos: [-4.5, 2.8, -3], rot: [0.4, 0.2, -1.2], s: 0.45, streak: 0, o: 0 },
];

const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function createMascot(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // ---------- lighting ----------
  scene.add(new THREE.HemisphereLight(0x6f9bff, 0x020818, 0.9));
  const key = new THREE.DirectionalLight(0xb3ccff, 2.2); key.position.set(-4, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(0x39ff7a, 38, 30); rim.position.set(4, 2, -3); scene.add(rim);
  const rim2 = new THREE.PointLight(0x2f6bff, 70, 30); rim2.position.set(-5, -2, -2); scene.add(rim2);
  const front = new THREE.PointLight(0x8dffb4, 14, 14); front.position.set(1, -1, 5); scene.add(front);

  // ---------- materials ----------
  const skin = new THREE.MeshPhysicalMaterial({ color: 0x3fbf72, roughness: 0.45, sheen: 1, sheenColor: 0xc8ffd9, clearcoat: 0.3 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0x2f9a5e, roughness: 0.5 });
  const jacket = new THREE.MeshStandardMaterial({ color: 0x0e2458, roughness: 0.78, metalness: 0.05 });
  const jacketHi = new THREE.MeshStandardMaterial({ color: 0x173a85, roughness: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x0c1428, roughness: 0.28, metalness: 0.85 });
  const neon = new THREE.MeshStandardMaterial({ color: 0x39ff7a, emissive: 0x2cff6e, emissiveIntensity: 1.15, roughness: 0.4 });
  const lens = new THREE.MeshStandardMaterial({ color: 0x001a0a, emissive: 0x7dff3c, emissiveIntensity: 1.6, roughness: 0.1, metalness: 0.2 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe8f0ff, roughness: 0.55 });
  const sole = new THREE.MeshStandardMaterial({ color: 0x4dff8a, emissive: 0x39ff7a, emissiveIntensity: 0.9, roughness: 0.5 });

  const mesh = (geo, mat, parent, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p); m.rotation.set(...r); m.scale.set(...s);
    parent.add(m);
    return m;
  };

  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  scene.add(root);

  // ---------- head ----------
  const head = new THREE.Group(); head.position.y = 1.25; rig.add(head);
  mesh(new THREE.SphereGeometry(1, 48, 32), skin, head, [0, 0, 0], [0, 0, 0], [1.28, 0.9, 1.08]);
  // cheeks / jaw
  mesh(new THREE.SphereGeometry(1, 32, 24), skin, head, [0, -0.28, 0.2], [0, 0, 0], [1.18, 0.62, 0.95]);
  // mouth line (neon grin)
  mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 40, Math.PI * 0.8), neon, head, [0, -0.22, 0.98], [0, 0, Math.PI * 1.1 + 0.05], [1, 0.55, 1]);
  // eye bulbs + goggles
  const eyes = [];
  for (const side of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(side * 0.58, 0.62, 0.25); head.add(eg);
    mesh(new THREE.SphereGeometry(0.44, 32, 24), skin, eg);
    mesh(new THREE.TorusGeometry(0.34, 0.1, 16, 40), metal, eg, [0, 0.02, 0.36], [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 40), lens, eg, [0, 0.02, 0.4], [Math.PI / 2, 0, 0]);
    const pupil = mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color: 0xefffe0 }), eg, [side * 0.05, 0.05, 0.44]);
    eyes.push(pupil);
    // little antenna/fin on goggles
    mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), neon, eg, [side * 0.34, 0.26, 0.12], [0, 0, -side * 0.5]);
  }
  // goggle strap wraps around the head
  mesh(new THREE.TorusGeometry(1.12, 0.07, 12, 64), metal, head, [0, 0.42, -0.05], [Math.PI / 2 - 0.12, 0, 0], [1.1, 0.96, 1]);
  mesh(new THREE.BoxGeometry(0.34, 0.14, 0.16), metal, head, [0, 0.62, 0.62], [0.2, 0, 0]);

  // ---------- body / jacket ----------
  const torso = mesh(new THREE.CapsuleGeometry(0.72, 0.9, 12, 32), jacket, rig, [0, -0.15, 0], [0, 0, 0], [1.15, 1, 0.9]);
  // hood collar
  mesh(new THREE.TorusGeometry(0.62, 0.22, 16, 40), jacketHi, rig, [0, 0.55, -0.05], [Math.PI / 2 + 0.25, 0, 0], [1.2, 1, 1]);
  // zipper neon line
  mesh(new THREE.BoxGeometry(0.035, 1.1, 0.035), neon, rig, [0.08, -0.3, 0.7], [0.05, 0, 0]);
  // hem stripe (low, so it doesn't cross the zipper)
  mesh(new THREE.TorusGeometry(0.8, 0.022, 8, 60), neon, rig, [0, -1.0, 0], [Math.PI / 2, 0, 0], [1.02, 0.86, 1]);
  // backpack
  const pack = mesh(new THREE.CapsuleGeometry(0.42, 0.55, 8, 20), metal, rig, [0, -0.05, -0.78], [0, 0, 0], [1.3, 1, 0.65]);
  mesh(new THREE.BoxGeometry(0.62, 0.05, 0.05), neon, pack, [0, 0.28, -0.42]);
  mesh(new THREE.BoxGeometry(0.62, 0.05, 0.05), neon, pack, [0, 0.05, -0.42]);

  // ---------- limbs ----------
  const limb = (parent, pos, len, radius, mat) => {
    const pivot = new THREE.Group(); pivot.position.set(...pos); parent.add(pivot);
    const seg = mesh(new THREE.CapsuleGeometry(radius, len, 8, 20), mat, pivot, [0, -len / 2 - radius * 0.3, 0]);
    return { pivot, seg, len };
  };
  const arms = [], legs = [];
  for (const side of [-1, 1]) {
    const upper = limb(rig, [side * 0.9, 0.35, 0], 0.7, 0.26, jacket);
    upper.pivot.rotation.z = side * 2.1; // arms spread out (skydive)
    mesh(new THREE.TorusGeometry(0.27, 0.035, 8, 30), neon, upper.seg, [0, -0.1, 0], [Math.PI / 2, 0, 0]);
    const fore = limb(upper.pivot, [0, -1.05, 0], 0.55, 0.21, skinDark);
    fore.pivot.rotation.z = side * -0.4;
    // glove
    const glove = mesh(new THREE.SphereGeometry(0.3, 24, 16), metal, fore.pivot, [0, -0.95, 0.02], [0, 0, 0], [1, 0.8, 0.55]);
    mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 24), neon, glove, [0, 0.18, 0], [Math.PI / 2, 0, 0]);
    for (let i = -1; i <= 1; i++) mesh(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), skinDark, glove, [i * 0.13, -0.32, 0]);
    arms.push({ upper, fore, side });

    const thigh = limb(rig, [side * 0.42, -1.05, 0], 0.55, 0.3, jacket);
    thigh.pivot.rotation.set(-0.5, 0, side * 0.45);
    const shin = limb(thigh.pivot, [0, -0.95, 0], 0.5, 0.24, jacketHi);
    shin.pivot.rotation.x = 0.9;
    // chunky sneaker
    const shoe = new THREE.Group(); shoe.position.set(0, -0.92, 0.15); shin.pivot.add(shoe);
    mesh(new THREE.CapsuleGeometry(0.28, 0.5, 8, 20), white, shoe, [0, 0, 0.1], [Math.PI / 2, 0, 0], [1, 1, 0.9]);
    mesh(new THREE.BoxGeometry(0.62, 0.14, 1.12), sole, shoe, [0, -0.24, 0.1], [0, 0, 0]);
    mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 30, Math.PI), neon, shoe, [0, 0.12, 0.1], [0, Math.PI / 2, 0]);
    legs.push({ thigh, shin, side });
  }

  // ---------- particles (speed dust) ----------
  const dustGeo = new THREE.BufferGeometry();
  const N = 420, pts = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pts[i * 3] = (Math.random() - 0.5) * 30; pts[i * 3 + 1] = (Math.random() - 0.5) * 20; pts[i * 3 + 2] = -Math.random() * 20 + 4; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xbfd6ff, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.35, 0.88);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- state ----------
  let progress = 0, smooth = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let current = { pos: [...KEYS[0].pos], rot: [...KEYS[0].rot], s: KEYS[0].s, streak: 0, o: 1 };
  let visible = true;
  let narrow = false;

  function sample(p) {
    p = Math.min(1, Math.max(0, p));
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const t = ease(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
    return {
      pos: a.pos.map((v, k) => lerp(v, b.pos[k], t)),
      rot: a.rot.map((v, k) => lerp(v, b.rot[k], t)),
      s: lerp(a.s, b.s, t), streak: lerp(a.streak, b.streak, t), o: lerp(a.o, b.o, t),
    };
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
    camera.aspect = w / h;
    // keep the character framed on narrow screens
    narrow = w < 900;
    camera.position.z = narrow ? 15 : 10;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    smooth += (progress - smooth) * 0.085;
    const k = sample(smooth);
    if (narrow) {
      // phones: keep Pip in the top band, above the copy, and compress sideways motion
      const heroMix = Math.max(0, 1 - smooth / 0.1);
      k.pos = [k.pos[0] * 0.35 + heroMix * 0.4, k.pos[1] + heroMix * 3.6 + (1 - heroMix) * 1.2, k.pos[2]];
      k.s *= 0.85;
    }
    current = k;
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;

    const heroW = Math.max(0, 1 - smooth * 10); // mouse parallax fades out after hero
    root.position.set(k.pos[0] + mouse.sx * 0.3 * heroW, k.pos[1] + Math.sin(t * 1.3) * 0.08 - mouse.sy * 0.2 * heroW, k.pos[2]);
    root.rotation.set(k.rot[0] + mouse.sy * 0.25 * heroW, k.rot[1] + mouse.sx * 0.5 * heroW, k.rot[2] + Math.sin(t * 0.9) * 0.04);
    root.scale.setScalar(k.s);

    // wind flutter on limbs
    const flut = 0.35 + (1 - heroW) * 0.65;
    arms.forEach(({ upper, fore, side }, i) => {
      upper.pivot.rotation.z = side * (2.1 + Math.sin(t * 7 + i) * 0.05 * flut);
      upper.pivot.rotation.x = Math.sin(t * 5.3 + i * 2) * 0.06 * flut;
      fore.pivot.rotation.z = side * (-0.4 + Math.sin(t * 6 + i) * 0.08 * flut);
    });
    legs.forEach(({ thigh, shin, side }, i) => {
      thigh.pivot.rotation.x = -0.5 + Math.sin(t * 6.5 + i * 3) * 0.08 * flut;
      shin.pivot.rotation.x = 0.9 + Math.sin(t * 5.5 + i) * 0.1 * flut;
    });
    head.rotation.z = Math.sin(t * 1.7) * 0.03;
    eyes.forEach((e, i) => { e.scale.y = (Math.sin(t * 0.8 + 1.2) > 0.985) ? 0.1 : 1; });
    lens.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.3;
    rim.position.x = 4 + Math.sin(t * 0.6) * 1.5;

    // dust streams upward as we fall
    const arr = dustGeo.attributes.position.array;
    const speed = 0.02 + (1 - heroW) * 0.18;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += speed;
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
    }
    dustGeo.attributes.position.needsUpdate = true;

    canvas.style.opacity = k.o.toFixed(3);
    if (visible && k.o > 0.01) composer.render(dt);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    keys: KEYS,
    setProgress(p) { progress = p; },
    get state() { return current; },
    setVisible(v) { visible = v; },
  };
}
