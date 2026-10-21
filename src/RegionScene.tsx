import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { places } from './content';
import { L, text, type Lang } from './i18n';
import { boundaryPolygons, projectCoordinate, type Boundary } from './region-geometry';
import { type ElevationGrid } from './region-terrain';
import { regionalSurface, surfaceHeight, surfaceBounds } from './region-surface';
import { regionMotion, cameraEase } from './region-motion';
import { regionMask, applyRegionMask, type RegionWater } from './region-water';
import { frameRegion, REGION_OVERVIEW_DIRECTION } from './region-framing';

interface Props { lang: Lang; selected: string; onSelect: (id: string) => void; reduced: boolean }
type CameraAction = 'left' | 'right' | 'up' | 'down' | 'in' | 'out' | 'reset';
const labels = {
  scene: L('Объёмная карта области Абай', 'Абай облысының көлемді картасы', 'Abai Region in three dimensions'),
  help: L('Стрелки — поворот, + и − — масштаб, Home — исходный вид.', 'Бағыт пернелері — бұру, + және − — масштаб, Home — бастапқы көрініс.', 'Arrow keys rotate, + and − zoom, Home resets the view.'),
  loading: L('Открываем область Абай…', 'Абай өлкесін ашудамыз…', 'Opening Abai Region…'),
  unavailable: L('Объёмный вид недоступен. Выберите историю в списке ниже.', 'Көлемді көрініс қолжетімсіз. Төмендегі тізімнен тарихты таңдаңыз.', 'The 3D view is unavailable. Choose a story from the list below.'),
  flat: L('Показана плоская схема. Истории доступны в списке ниже.', 'Жазық сызба көрсетілген. Тарихтар төмендегі тізімде.', 'Showing a flat overview. Stories are available in the list below.'),
};

export default function RegionScene({ lang, selected, onSelect, reduced }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);
  const action = useRef<(value: CameraAction) => void>(() => {});
  const refresh = useRef<() => void>(() => {});
  const leaders = useRef<(SVGLineElement | null)[]>([]);
  const [hasTerrain, setHasTerrain] = useState(false);
  const selection = useRef(selected); selection.current = selected;
  const [status, setStatus] = useState<'loading' | 'ready' | 'flat' | 'error'>('loading');
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const abort = new AbortController();
    let disposed = false, frame = 0, visible = true;
    let flight: { started: number; from: THREE.Vector3; targetFrom: THREE.Vector3; to: THREE.Vector3; targetTo: THREE.Vector3 } | null = null;
    const overviewPosition = new THREE.Vector3(), overviewTarget = new THREE.Vector3();
    let fitPoints: THREE.Vector3[] = [];
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let resize: ResizeObserver | undefined;
    let intersection: IntersectionObserver | undefined;
    const scene = new THREE.Scene();
    // A sculptural presentation, without changing source coordinates or elevations.
    const reliefScale = 1.8, baseDepth = -.65;
    const displayHeight = (height: number) => .36 + (height - .28) * reliefScale;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 70);
    const markers: { object: THREE.Mesh; location: THREE.Vector3 }[] = [];
    const textures: THREE.Texture[] = [];
    function invalidate() {
      if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
    }
    function cancelFlight() { flight = null; if (controls) controls.enableDamping = !reduced; }
    function fly(to: THREE.Vector3, targetTo: THREE.Vector3) {
      if (!controls) return;
      controls.enableDamping = false;
      if (reduced) { flight = null; camera.position.copy(to); controls.target.copy(targetTo); controls.update(); }
      else flight = { started: performance.now(), from: camera.position.clone(), targetFrom: controls.target.clone(), to, targetTo };
      invalidate();
    }
    function render(now: number) {
      frame = 0;
      if (disposed || !visible || !renderer || !controls) return;
      if (flight) {
        const progress = Math.min(1, (now - flight.started) / regionMotion.cameraDuration), eased = cameraEase(progress);
        camera.position.lerpVectors(flight.from, flight.to, eased); controls.target.lerpVectors(flight.targetFrom, flight.targetTo, eased);
        if (progress === 1) { flight = null; controls.enableDamping = !reduced; }
      }
      controls.update();
      const width = element!.clientWidth, height = element!.clientHeight;
      const projected = markers.map(({ object, location }, index) => {
        const point = location.clone().project(camera), active = places[index].id === selection.current;
        object.scale.setScalar(active ? 1.65 : 1);
        return { index, x: (point.x * .5 + .5) * width, y: (-point.y * .5 + .5) * height,
          shown: point.z < 1 && Math.abs(point.x) < .99 && Math.abs(point.y) < .99, active };
      }).sort((a,b) => Number(b.active) - Number(a.active) || a.y - b.y);
      const badges: { left: number; top: number; right: number; bottom: number }[] = [], labelBoxes: typeof badges = [];
      const placed: typeof projected = [];
      for (const point of projected) {
        const pin = pins.current[point.index], line = leaders.current[point.index];
        if (!pin) continue;
        pin.style.visibility = point.shown ? 'visible' : 'hidden';
        if (!point.shown) { if (line) line.style.display = 'none'; continue; }
        const clampX = (x: number) => Math.max(24, Math.min(width - 24, x));
        const clampY = (y: number) => Math.max(25, Math.min(height - 25, y));
        const candidates = [[0,0],[-46,0],[46,0],[0,-46],[0,46],[-36,-36],[36,36],[-36,36],[36,-36]];
        let best = { x: clampX(point.x), y: clampY(point.y), score: Infinity };
        for (const [dx,dy] of candidates) {
          const x = clampX(point.x + dx), y = clampY(point.y + dy);
          const collisions = badges.filter(b => x+21>b.left && x-21<b.right && y+21>b.top && y-21<b.bottom).length;
          const score = collisions*10000 + dx*dx + dy*dy;
          if (score < best.score) best = { x,y,score };
        }
        pin.style.left = best.x+'px'; pin.style.top = best.y+'px';
        if (line) {
          line.style.display = Math.hypot(best.x-point.x,best.y-point.y)>7 ? 'block' : 'none';
          line.setAttribute('x1',String(point.x)); line.setAttribute('y1',String(point.y));
          line.setAttribute('x2',String(best.x)); line.setAttribute('y2',String(best.y));
        }
        placed.push({...point,x:best.x,y:best.y}); badges.push({left:best.x-20,right:best.x+20,top:best.y-20,bottom:best.y+20});
      }
      for (const {index,x,y} of placed) {
        const pin = pins.current[index]!, label = pin.querySelector<HTMLElement>('.region-pin-label');
        if (!label) continue;
        const w=label.offsetWidth,h=label.offsetHeight,half=pin.offsetWidth/2;
        const preferLeft=places[index].id==='zhidebay'||places[index].id==='konyr';
        const candidates=[[x+(preferLeft?-w-25:25),y-h/2],[x+(preferLeft?25:-w-25),y-h/2],[x-w/2,y-h-27],[x-w/2,y+27],[x+27,y+28],[x-w-27,y+28],[x+27,y-h-28],[x-w-27,y-h-28]];
        let best={left:5,top:5,score:Infinity};
        for(const [a,b] of candidates){
          const left=Math.max(5,Math.min(width-w-5,a)),top=Math.max(5,Math.min(height-h-5,b));
          const collisions=[...badges,...labelBoxes].filter(box=>left<box.right&&left+w>box.left&&top<box.bottom&&top+h>box.top).length;
          const score=collisions*10000+Math.abs(left-a)+Math.abs(top-b);
          if(score<best.score) best={left,top,score};
        }
        label.style.left=best.left-x+half+'px';label.style.right='auto';label.style.top=best.top-y+half+'px';
        labelBoxes.push({left:best.left,right:best.left+w,top:best.top,bottom:best.top+h});
      }
      element!.dataset.azimuth = camera.position.x.toFixed(2);
      element!.dataset.distance = controls.getDistance().toFixed(2);
      element!.dataset.flying = String(!!flight);
      renderer.render(scene, camera);
      if (flight) invalidate();
    }
    function visibility() { if (!document.hidden) invalidate(); }
    function contextLost(event: Event) { event.preventDefault(); cancelFlight(); setStatus('flat'); }
    function fitOverview() {
      if (!controls || !element!.clientHeight) return;
      flight = null;
      camera.aspect=element!.clientWidth/element!.clientHeight;
      const distance=frameRegion(camera,fitPoints,overviewTarget,new THREE.Vector3(...REGION_OVERVIEW_DIRECTION));
      controls.target.copy(overviewTarget);
      controls.minDistance=distance*.6;
      controls.maxDistance=distance*1.45;
      overviewPosition.copy(camera.position);controls.update();controls.saveState();
    }

    async function init() {
      try {
        const [response, grid, water] = await Promise.all([
          fetch(import.meta.env.BASE_URL+'data/abay-boundary.geojson',{signal:abort.signal}),
          fetch(import.meta.env.BASE_URL+'data/abay-elevation.json',{signal:abort.signal}).then(async r=>r.ok?await r.json() as ElevationGrid:null).catch(()=>null),
          fetch(import.meta.env.BASE_URL+'data/abay-water.geojson',{signal:abort.signal}).then(async r=>r.ok?await r.json() as RegionWater:null).catch(()=>null),
        ]);
        if (!response.ok) throw new Error('Boundary unavailable');
        const polygons = boundaryPolygons(await response.json() as Boundary);
        if (disposed) return;
        const terrain=grid&&grid.elevations.length===grid.width*grid.height?grid:null;
        setHasTerrain(!!terrain);
        setPaths(polygons.map(rings => rings.map(ring => ring.map((point, i) => {
          const [x, y] = projectCoordinate(point);
          return `${i ? 'L' : 'M'}${x.toFixed(3)},${(-y).toFixed(3)}`;
        }).join(' ') + ' Z').join(' ')));
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        } catch { setStatus('flat'); return; }
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        element!.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.addEventListener('webglcontextlost', contextLost);

        scene.add(new THREE.HemisphereLight(0xf7edd8, 0x244a42, 1.5));
        const sunlight = new THREE.DirectionalLight(0xffe6b5, 2.8);
        sunlight.position.set(-6, 8, 5); scene.add(sunlight);
        const rim = new THREE.DirectionalLight(0xc3e4ca, 1.5);
        rim.position.set(5, 4, -6); scene.add(rim);

        const top=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,metalness:.06});
        const side=new THREE.MeshStandardMaterial({color:0x536956,roughness:.9,metalness:0,side:THREE.DoubleSide});
        const border=new THREE.LineBasicMaterial({color:0xe1d5ab,transparent:true,opacity:.65});
        const contour=new THREE.LineBasicMaterial({color:0xf4e2b8,transparent:true,opacity:.16});
        const mask=regionMask(polygons,water,surfaceBounds(polygons[0],terrain));textures.push(mask.texture);
        applyRegionMask(top,mask,true);applyRegionMask(contour,mask,false);
        for(const rings of polygons){
          const surface=regionalSurface(rings,terrain);
          for(const geometry of [surface.surface,surface.walls,surface.contours]){
            const positions=geometry.getAttribute('position');
            for(let i=0;i<positions.count;i++)positions.setY(i,positions.getY(i)<0?baseDepth:displayHeight(positions.getY(i)));
            positions.needsUpdate=true;
            if(geometry!==surface.contours)geometry.computeVertexNormals();
          }
          scene.add(new THREE.Mesh(surface.surface,top),new THREE.Mesh(surface.walls,side),new THREE.LineSegments(surface.contours,contour));
          for(const outline of surface.outlines){
            scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(outline.map(p=>p.clone().setY(displayHeight(p.y)+.006))),border));
            scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(outline.map(p=>p.clone().setY(baseDepth))),border));
          }
        }
        const ringGeometry = new THREE.TorusGeometry(.13, .012, 5, 36);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xe7c78c });
        const dotGeometry = new THREE.SphereGeometry(.047, 12, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffe2a1 });
        places.forEach(place => {
          const [x, y] = projectCoordinate(place.coordinate), elevation = displayHeight(surfaceHeight(terrain, place.coordinate));
          const ring = new THREE.Mesh(ringGeometry, ringMaterial); ring.rotation.x = -Math.PI / 2; ring.position.set(x, elevation + .025, -y); scene.add(ring);
          const dot = new THREE.Mesh(dotGeometry, dotMaterial); dot.position.set(x, elevation + .065, -y); scene.add(dot);
          markers.push({ object: ring, location: new THREE.Vector3(x, elevation + .09, -y) });
        });

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false; controls.enableDamping = !reduced; controls.dampingFactor = .1;
        controls.minDistance = 3; controls.maxDistance = 70;
        controls.minPolarAngle = .15; controls.maxPolarAngle = 1.15;
        controls.rotateSpeed = .55; controls.zoomSpeed = .7;
        // Preserve ordinary page scrolling: zoom is explicit or a two-finger gesture.
        renderer.domElement.addEventListener('wheel', e => {
          if (document.activeElement !== element && !e.ctrlKey) e.stopImmediatePropagation();
        }, { capture: true });
        fitPoints=polygons.flatMap(rings=>rings[0].flatMap(p=>{const [x,y]=projectCoordinate(p);return [new THREE.Vector3(x,displayHeight(surfaceHeight(terrain,p)),-y),new THREE.Vector3(x,baseDepth,-y)];}));
        // The terrain grid extends beyond the masked region. Fit the real outline,
        // not that invisible rectangular grid, or the model appears off-centre.
        overviewTarget.copy(new THREE.Box3().setFromPoints(fitPoints).getCenter(new THREE.Vector3()));
        fitOverview();
        action.current = value => {
          if (!controls) return;
          if(value==='reset'){fly(overviewPosition.clone(),overviewTarget.clone());return;}
          cancelFlight();
          if (value === 'left') controls.rotateLeft(.23);
          if (value === 'right') controls.rotateLeft(-.23);
          if (value === 'up') controls.rotateUp(.15);
          if (value === 'down') controls.rotateUp(-.15);
          if (value === 'in'||value === 'out') {
            const distance=Math.min(controls.maxDistance,Math.max(controls.minDistance,controls.getDistance()*(value==='in'?.82:1/.82)));
            fly(camera.position.clone().sub(controls.target).normalize().multiplyScalar(distance).add(controls.target),controls.target.clone());
            return;
          }

          controls.update(); invalidate();
        };
        refresh.current = invalidate;
        controls.addEventListener('start', cancelFlight);
        controls.addEventListener('change', invalidate);
        resize = new ResizeObserver(() => {
          if (!renderer || !element!.clientHeight) return;
          const target=(flight?.targetTo??controls!.target).clone();
          const offset=(flight?.to??camera.position).clone().sub(target);
          const oldDistance=overviewPosition.distanceTo(overviewTarget);
          renderer.setSize(element!.clientWidth,element!.clientHeight);fitOverview();
          const ratio=oldDistance?overviewPosition.distanceTo(overviewTarget)/oldDistance:1;
          controls!.target.copy(overviewTarget);camera.position.copy(overviewTarget).addScaledVector(offset,ratio);controls!.update();invalidate();
        }); resize.observe(element!);
        intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) invalidate(); });
        intersection.observe(element!);
        document.addEventListener('visibilitychange', visibility);
        setStatus('ready'); invalidate();
      } catch { if (!disposed) setStatus('error'); }
    }
    void init();
    return () => {
      disposed = true; abort.abort(); cancelAnimationFrame(frame);
      resize?.disconnect(); intersection?.disconnect(); document.removeEventListener('visibilitychange', visibility);
      controls?.dispose(); action.current = () => {}; refresh.current = () => {};
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
        }
      });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      if (renderer) { renderer.domElement.removeEventListener('webglcontextlost', contextLost); renderer.dispose(); renderer.domElement.remove(); }
    };
  }, [reduced]);

  useEffect(() => {
    // Selection changes the highlighted place, never the user's camera position.
    refresh.current();
  }, [selected,status,lang]);
  const t = (value: ReturnType<typeof L>) => text(value, lang);
  return <div className={'region-scene is-' + status} data-relief={hasTerrain}>
    <div ref={host} className="region-webgl" role="group" tabIndex={0} aria-label={t(labels.scene)} aria-describedby="region-keyboard-help" onPointerDown={e => {
      if (e.target instanceof HTMLCanvasElement) e.currentTarget.focus({ preventScroll: true });
    }} onKeyDown={e => {
      if (e.target !== e.currentTarget) return;
      const keyActions: Record<string, CameraAction> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', Home: 'reset' };
      const command = keyActions[e.key];
      if (command) { e.preventDefault(); action.current(command); }
    }}>
      {status === 'ready' && <div className="region-pins"><svg className="region-pin-leaders" aria-hidden="true">{places.map((place,index)=><line key={place.id} ref={node=>{leaders.current[index]=node;}}/>)}</svg>{places.map((place, index) => <button key={place.id} ref={node => { pins.current[index] = node; }} className={'region-pin pin-' + place.id} onClick={() => onSelect(place.id)} onPointerEnter={()=>refresh.current()} onPointerLeave={()=>refresh.current()} onFocus={()=>refresh.current()} aria-pressed={place.id === selected} aria-label={text(place.name, lang)}><span className="region-pin-dot" aria-hidden="true"/><span className="region-pin-label">{text(place.name, lang)}</span></button>)}</div>}
    </div>
    {(status === 'flat' || status === 'error') && <div className="region-flat">
      {paths.length > 0 && <svg viewBox="-5 -6 10 12" role="img" aria-label={t(labels.scene)}>{paths.map((path, i) => <path key={i} d={path} fillRule="evenodd"/>)}</svg>}
      <p role="status">{t(paths.length ? labels.flat : labels.unavailable)}</p>
    </div>}
    {status === 'loading' && <div className="region-loading" role="status"><span className="spinner"/>{t(labels.loading)}</div>}
    <p id="region-keyboard-help" className="sr-only">{t(labels.help)}</p>
  </div>;
}
