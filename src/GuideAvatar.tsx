import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Hand } from 'lucide-react';
import type { Lang } from './i18n';
import './guide-avatar.css';

/**
 * Zholserik is an original fictional IZQOR guide, not a reconstruction of a historical person.
 * Original head, costume, ornaments and hands are authored below with Three.js geometry.
 * Skeleton / animation source: Kenney Mini Characters 1.0, character-male-a.glb.
 * https://kenney.nl/assets/mini-characters — CC0 (public domain); adaptation permitted.
 * The unmodified source rig lives at public/models/guide-base.glb. No paid generation.
 */
export type GuideAvatarProps = {
  step: number;
  reduced: boolean;
  compact?: boolean;
  speaking?: boolean;
  onReady?: () => void;
  lang?: Lang;
  focusPoint?: { x: number; y: number };
};

type AvatarController = {
  change: (step: number, reduced: boolean, compact: boolean, speaking: boolean, focusPoint?: { x: number; y: number }) => void;
  hello: () => void;
  turn: (delta: number) => void;
};
const avatarCopy = {
  ru: {label:'Жолсерік — нажмите, чтобы поздороваться',hint:'Нажмите на меня',hello:'Рад вас видеть!',title:'Нажмите или Enter — приветствие. Потяните в сторону или используйте стрелки — поворот.'},
  kk: {label:'Жолсерікпен амандасу үшін басыңыз',hint:'Мені басыңыз',hello:'Кездескеніме қуаныштымын!',title:'Басыңыз немесе Enter — амандасу. Қапталға сүйреңіз не бағыттауыштарды басыңыз — бұрылу.'},
  en: {label:'Zholserik — tap to say hello',hint:'Tap to say hello',hello:'Good to see you!',title:'Tap or press Enter to say hello. Drag sideways or use the arrow keys to turn.'},
};
const ivory = '#cfcdc1';

export default function GuideAvatar({ step, reduced, compact = false, speaking = false, onReady, lang = 'ru', focusPoint }: GuideAvatarProps) {
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);
  const controller = useRef<AvatarController | null>(null);
  const latest = useRef({ step, reduced, compact, speaking, onReady, focusPoint });
  latest.current = { step, reduced, compact, speaking, onReady, focusPoint };
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [reactionCount,setReactionCount]=useState(0);
  const [greeting,setGreeting]=useState(false);
  const words=avatarCopy[lang];
  function sayHello(){setReactionCount(n=>n+1);setGreeting(true);controller.current?.hello();}
  useEffect(()=>{if(!greeting)return;const timer=window.setTimeout(()=>setGreeting(false),2600);return()=>window.clearTimeout(timer);},[greeting,reactionCount]);

  useEffect(() => {
    if (!host.current) return;
    const target = host.current;
    const interactive=surface.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setFailed(true); latest.current.onReady?.(); return;
    }
    let disposed = false, broken = false, frame = 0, inView = true, dirty = true, last = 0;
    let mixer: THREE.AnimationMixer | undefined;
    let idle: THREE.AnimationAction | undefined, gesture: THREE.AnimationAction | undefined;
    let face: THREE.Group | undefined, jaw: THREE.Group | undefined;
    let leftEye: THREE.Group | undefined, rightEye: THREE.Group | undefined;
    let leftLid: THREE.Mesh | undefined, rightLid: THREE.Mesh | undefined;
    const eyeWhites:THREE.Mesh[]=[];
    let previousStep = latest.current.step;
    let previousFocus=latest.current.focusPoint;
    let activeUntil = 0, elapsed = .8;
    let greetingStart=-10000,greetingUntil=0,pointingSide=0;
    let hovered=false,targetYaw=0,currentYaw=0;
    const gazeTarget=new THREE.Vector2(),gazeCurrent=new THREE.Vector2();
    const armBones=new Map<string,THREE.Object3D>(),armRest=new Map<string,THREE.Quaternion>(),armBase=new Map<string,THREE.Quaternion>();
    const actions = new Map<string, THREE.AnimationAction>();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-.45, .45, .45, -.45, .01, 10);
    const root = new THREE.Group();
    root.rotation.y = 0;
    scene.add(root);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    target.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight('#f4ead9', '#526367', 1.8);
    scene.add(hemi);
    const key = new THREE.DirectionalLight('#ffebd3', 2.0);
    key.position.set(-2, 3, 4); scene.add(key);
    const fill = new THREE.DirectionalLight('#e0eeea', .9);
    fill.position.set(3, 1, 2); scene.add(fill);
    const rim = new THREE.DirectionalLight('#efcf9c', 1.45);
    rim.position.set(1, 2, -3); scene.add(rim);

    const skin = new THREE.MeshStandardMaterial({ color: '#c68e64', roughness: .79 });
    const skinLight = new THREE.MeshStandardMaterial({ color: '#d0a178', roughness: .79 });
    const skinShade = new THREE.MeshStandardMaterial({ color: '#b37d59', roughness: .84 });
    const coat = new THREE.MeshStandardMaterial({ color: '#154d4c', roughness: .81 });
    const collar = new THREE.MeshStandardMaterial({ color: '#0c3336', roughness: .74 });
    const gold = new THREE.MeshStandardMaterial({ color: '#c99d54', metalness: .53, roughness: .4 });
    const paleGold = new THREE.MeshStandardMaterial({ color: '#ead3a1', metalness: .28, roughness: .49 });
    const hair = new THREE.MeshStandardMaterial({ color: ivory, roughness: .91 });
    const hairShade = new THREE.MeshStandardMaterial({ color: '#a3a99f', roughness: .93 });
    const eyeWhite = new THREE.MeshStandardMaterial({ color: '#f3e9d7', roughness: .29 });
    const iris = new THREE.MeshStandardMaterial({ color: '#5a4935', roughness: .35 });
    const pupil = new THREE.MeshStandardMaterial({ color: '#171e1d', roughness: .23 });
    const gloss = new THREE.MeshBasicMaterial({ color: '#fffaf0' });
    const lip = new THREE.MeshStandardMaterial({ color: '#8f4b39', roughness: .74 });
    const dark = new THREE.MeshStandardMaterial({ color: '#29282a', roughness: .7 });
    const materials = [skin, skinLight, skinShade, coat, collar, gold, paleGold, hair, hairShade, eyeWhite, iris, pupil, gloss, lip, dark];
    const sphereGeometry = new THREE.SphereGeometry(1, 40, 28);
    function oval(parent: THREE.Object3D, material: THREE.Material, at: number[], scale: number[]) {
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.set(at[0], at[1], at[2]); mesh.scale.set(scale[0], scale[1], scale[2]);
      parent.add(mesh); return mesh;
    }
    function curve(parent: THREE.Object3D, material: THREE.Material, points: number[][], radius: number, closed = false) {
      const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])), closed);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(16, points.length * 6), radius, 7, closed), material);
      parent.add(mesh); return mesh;
    }
    function ring(parent: THREE.Object3D, radius: number, tube: number, y: number, material: THREE.Material, depth = 1) {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 64), material);
      mesh.rotation.x = Math.PI / 2; mesh.position.y = y; mesh.scale.y = depth; parent.add(mesh); return mesh;
    }
    function diamond(parent: THREE.Object3D, x: number, y: number, z: number, size: number) {
      curve(parent, gold, [[x,y+size,z],[x+size*.6,y,z+.001],[x,y-size,z],[x-size*.6,y,z+.001]], .0013, true);
    }
    function makeHead(bone: THREE.Object3D) {
      face=new THREE.Group();bone.add(face);
      // The warm, rounded original Zholserik: a soft face and a real silver beard.
      oval(face,skin,[0,.015,.008],[.041,.043,.042]);
      oval(face,skin,[0,.143,.005],[.119,.151,.105]);
      for(const side of [-1,1]) {
        oval(face,skin,[side*.117,.145,.002],[.024,.036,.022]);
        oval(face,skinShade,[side*.127,.145,.015],[.009,.022,.009]);
        oval(face,skinLight,[side*.065,.113,.089],[.032,.030,.019]);
        const eye=new THREE.Group();eye.position.set(side*.047,.175,.103);face.add(eye);
        const ball=oval(eye,eyeWhite,[0,0,.003],[.0225,.013,.011]);
        eyeWhites.push(ball);
        const gaze=new THREE.Group();gaze.position.set(0,0,.014);eye.add(gaze);
        oval(gaze,iris,[0,0,0],[.009,.010,.003]);
        oval(gaze,pupil,[0,0,.0025],[.0048,.006,.002]);
        oval(gaze,gloss,[-.0025,.003,.0045],[.002,.002,.001]);
        const lid=oval(eye,skinLight,[0,.012,.007],[.024,.003,.011]);
        curve(eye,skinShade,[[-.022,0,.010],[-.012,.012,.012],[0,.014,.012],[.013,.011,.011],[.022,0,.008]],.0016);
        curve(face,hairShade,[[side*.022,.211,.101],[side*.045,.219,.106],[side*.071,.213,.095]],.0055);
        curve(face,hair,[[side*.024,.214,.105],[side*.046,.222,.109],[side*.071,.216,.098]],.0045);
        curve(face,skinShade,[[side*.074,.174,.102],[side*.087,.177,.092]],.0008);
        curve(face,hairShade,[[side*.102,.17,.043],[side*.108,.128,.052],[side*.096,.076,.067]],.008);
        curve(face,hair,[[side*.106,.163,.048],[side*.109,.122,.056],[side*.094,.072,.070]],.0055);
        if(side<0){leftEye=gaze;leftLid=lid;}else{rightEye=gaze;rightLid=lid;}
        ball.name='eye-white';
      }
      oval(face,skinLight,[0,.152,.109],[.015,.030,.019]);
      oval(face,skinLight,[0,.131,.133],[.020,.015,.018]);
      oval(face,skinShade,[-.010,.123,.144],[.004,.002,.003]);
      oval(face,skinShade,[.010,.123,.144],[.004,.002,.003]);
      jaw=new THREE.Group();jaw.position.set(0,.082,.112);face.add(jaw);
      oval(jaw,lip,[0,0,0],[.028,.004,.006]);
      curve(jaw,lip,[[-.032,.008,-.002],[-.016,0,.006],[0,-.002,.008],[.017,0,.006],[.032,.008,-.002]],.0022);
      oval(jaw,skinLight,[0,-.009,.001],[.020,.004,.005]);
      // Original V1 beard surface, restored to the user's preferred silhouette.
      // Only a thin closed back is added; the visible u/t profile is unchanged.
      const beardPositions:number[]=[],beardIndices:number[]=[];
      const beardCols=40,beardRows=18,beardCount=(beardCols+1)*(beardRows+1);
      for(let layer=0;layer<2;layer++)for(let row=0;row<=beardRows;row++)for(let col=0;col<=beardCols;col++){
        const t=row/beardRows,u=col/beardCols*2-1;
        beardPositions.push(.108*u*(1-.19*t),(.108-.044*(1-u*u))*(1-t)+(-.015+.045*Math.abs(u))*t,.079+.045*Math.sqrt(Math.max(0,1-u*u))+.008*Math.sin(Math.PI*t)-.027*t-layer*.0025);
      }
      for(let layer=0;layer<2;layer++)for(let row=0;row<beardRows;row++)for(let col=0;col<beardCols;col++){
        const a=layer*beardCount+row*(beardCols+1)+col,b=a+beardCols+1;
        if(layer===0)beardIndices.push(a,b,a+1,a+1,b,b+1);else beardIndices.push(a,a+1,b,a+1,b+1,b);
      }
      for(let col=0;col<beardCols;col++)for(const row of [0,beardRows]){const a=row*(beardCols+1)+col;beardIndices.push(a,a+1,a+beardCount,a+1,a+beardCount+1,a+beardCount);}
      for(let row=0;row<beardRows;row++)for(const col of [0,beardCols]){const a=row*(beardCols+1)+col,b=a+beardCols+1;beardIndices.push(a,a+beardCount,b,a+beardCount,b+beardCount,b);}
      const beardGeometry=new THREE.BufferGeometry();beardGeometry.setAttribute('position',new THREE.Float32BufferAttribute(beardPositions,3));beardGeometry.setIndex(beardIndices);beardGeometry.computeVertexNormals();
      const beard=new THREE.Mesh(beardGeometry,hair);beard.name='zholserik-v1-beard';face.add(beard);
      for(const side of [-1,1]) {
        curve(face,hairShade,[[side*.005,.108,.132],[side*.023,.103,.140],[side*.041,.094,.128]],.008);
        curve(face,hair,[[side*.005,.111,.136],[side*.023,.106,.144],[side*.041,.097,.132]],.0055);
      }
      // The lower edge is inside the forehead cross-section at y=.23, so the
      // one-piece cap rests on the head. Gold stitches have no detached brim rings.
      const cap=new THREE.Group();cap.position.z=.005;face.add(cap);
      const profile=[new THREE.Vector2(0,.228),new THREE.Vector2(.095,.228),new THREE.Vector2(.104,.241),new THREE.Vector2(.103,.253),new THREE.Vector2(.092,.272),new THREE.Vector2(.062,.294),new THREE.Vector2(.022,.306),new THREE.Vector2(0,.308)];
      const hat=new THREE.Mesh(new THREE.LatheGeometry(profile,64),coat);hat.scale.z=.88;cap.add(hat);
      for(let i=0;i<16;i++) {
        const a=i/16*Math.PI*2;
        const motif=new THREE.Group();motif.position.set(Math.sin(a)*.104,.245,Math.cos(a)*.104*.88);motif.rotation.y=a;cap.add(motif);
        diamond(motif,0,0,0,.0045);
      }
      return face;
    }
    function makeCostume(bones: Map<string, THREE.Object3D>) {
      const torso=bones.get('torso'); if (!torso) return;
      const garment=new THREE.Group();torso.add(garment);
      const profile=[new THREE.Vector2(0,-.15),new THREE.Vector2(.113,-.15),new THREE.Vector2(.113,-.13),new THREE.Vector2(.103,-.04),new THREE.Vector2(.098,.035),new THREE.Vector2(.132,.083),new THREE.Vector2(.140,.10),new THREE.Vector2(.125,.129),new THREE.Vector2(.085,.145),new THREE.Vector2(.042,.151),new THREE.Vector2(0,.15)];
      const robe=new THREE.Mesh(new THREE.LatheGeometry(profile,64),coat);robe.scale.z=.77;garment.add(robe);
      // Front overlap, collar and twin embroidered borders.
      for(const side of [-1,1]) {
        curve(garment,collar,[[side*.034,.149,.039],[side*.050,.119,.073],[side*.033,.045,.081],[side*.004,-.02,.080]],.010);
        curve(garment,gold,[[side*.036,.149,.047],[side*.049,.117,.080],[side*.030,.04,.087],[side*.003,-.025,.087],[side*.009,-.137,.085]],.0022);
        curve(garment,paleGold,[[side*.087,-.143,.047],[side*.10,-.14,.031],[side*.106,-.139,.004]],.0018);
        for(let j=0;j<3;j++) {
          const x=side*(.063+j*.002),y=.096-j*.038,z=.078;
          curve(garment,gold,[[x,y-.01,z],[x-side*.009,y,z+.002],[x,y+.009,z],[x+side*.010,y,z-.001],[x,y-.01,z]],.0017);
          oval(garment,paleGold,[x,y,z+.002],[.002,.002,.002]);
        }
        const arm=bones.get(side>0?'arm-left':'arm-right');
        if(arm) {
          const sleeve=oval(arm,coat,[side*.039,-.040,0],[.052,.074,.049]);sleeve.rotation.z=side*.28;
          const cuff=oval(arm,collar,[side*.043,-.094,.002],[.032,.021,.035]);cuff.rotation.z=side*.28;
          curve(arm,gold,[[side*.017,-.098,.021],[side*.044,-.109,.032],[side*.070,-.096,.021]],.0025);
          oval(arm,skin,[side*.047,-.122,.009],[.026,.031,.022]);
          oval(arm,skinLight,[side*.028,-.119,.029],[.010,.020,.012]);
          for(let f=0;f<3;f++) curve(arm,skinShade,[[side*(.037+f*.008),-.133,.028],[side*(.039+f*.008),-.143,.025]],.0008);
        }
        const leg=bones.get(side>0?'leg-left':'leg-right');
        if(leg) {
          oval(leg,collar,[0,-.085,0],[.031,.080,.032]);
          oval(leg,dark,[0,-.145,.018],[.037,.035,.055]);
          curve(leg,gold,[[-.026,-.132,.029],[0,-.137,.042],[.026,-.132,.029]],.0014);
        }
      }
      ring(garment,.103,.007,-.019,collar,.77);
      oval(garment,gold,[0,-.019,.087],[.016,.012,.004]);
      diamond(garment,0,-.019,.092,.007);
      ring(garment,.113,.0025,-.139,gold,.77);
    }

    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
    const ctx=shadowCanvas.getContext('2d');
    if(ctx) {const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(5,30,30,.27)');gradient.addColorStop(1,'rgba(5,30,30,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);}
    const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.7,.35),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=.004;scene.add(shadow);

    function frameCamera() {
      const rect=target.getBoundingClientRect();if(!rect.width||!rect.height)return;
      // Every size uses an adult chest-up portrait. Minimum width protects narrow mobile cards.
      const c=latest.current.compact;
      const aspect=rect.width/rect.height;
      const height=Math.max(c ? .48 : .52,(c ? .35 : .50)/aspect);
      camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;
      camera.position.set(.035,.495,2);camera.lookAt(0,.475,0);camera.updateProjectionMatrix();
      renderer.setSize(rect.width,rect.height);dirty=true;wake();
    }
    function screenGaze(point?:{x:number;y:number}) {
      if(!point)return new THREE.Vector2();
      const r=interactive.getBoundingClientRect();
      return new THREE.Vector2(THREE.MathUtils.clamp((point.x-r.left-r.width/2)/Math.max(80,r.width/2),-1,1),THREE.MathUtils.clamp((r.top+r.height/2-point.y)/Math.max(80,r.height/2),-1,1));
    }
    function playGesture(name:string) {
      if(!mixer)return;
      const action=actions.get(name);if(!action)return;
      gesture?.fadeOut(.14);gesture=action;action.reset().setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;
      action.setEffectiveWeight(1).fadeIn(.15).play();
      if(latest.current.reduced){action.stopFading().setEffectiveWeight(1);action.time=Math.min(action.getClip().duration*.5,.65);mixer.update(0);}
      activeUntil=performance.now()+Math.max(1700,action.getClip().duration*1000+250);dirty=true;wake();
    }
    function pointToFocus(next:number,point?:{x:number;y:number}) {
      greetingUntil=0;gazeTarget.copy(screenGaze(point));
      if(next===0||!point){pointingSide=0;interactive.dataset.pointing='none';playGesture('emote-yes');return;}
      const r=interactive.getBoundingClientRect();pointingSide=point.x>=r.left+r.width/2?1:-1;
      interactive.dataset.pointing=pointingSide>0?'right':'left';interactive.dataset.reaction='pointing';
      // Character-left is viewer-right: pick the actual arm toward the highlighted UI.
      playGesture(pointingSide>0?'interact-left':'interact-right');
    }
    controller.current={
      change(next,reduce,isCompact,isSpeaking,point){
        const changed=next!==previousStep;
        const moved=point?.x!==previousFocus?.x||point?.y!==previousFocus?.y;
        previousStep=next;previousFocus=point;
        if(!hovered)gazeTarget.copy(screenGaze(point));
        if(changed||(next>0&&moved))pointToFocus(next,point);
        if(reduce&&mixer)mixer.update(0);
        void isCompact;void isSpeaking;frameCamera();dirty=true;wake();
      },
      hello(){
        greetingStart=performance.now();greetingUntil=greetingStart+2400;pointingSide=0;
        interactive.dataset.reaction='greeting';interactive.dataset.pointing='none';
        playGesture('emote-yes');dirty=true;wake();
      },
      turn(delta){targetYaw=THREE.MathUtils.clamp(targetYaw+delta,-Math.PI/7.2,Math.PI/7.2);interactive.dataset.reaction='turning';dirty=true;wake();}
    };
    const loader=new GLTFLoader();
    loader.load(import.meta.env.BASE_URL+'models/guide-base.glb',gltf=>{
      if(disposed){disposeObject(gltf.scene);return;}
      const bones=new Map<string,THREE.Object3D>();
      gltf.scene.traverse(object=>{bones.set(object.name,object);if(object instanceof THREE.Mesh)object.visible=false;});
      root.add(gltf.scene);
      for(const name of ['arm-left','arm-right']){const arm=bones.get(name);if(arm){armBones.set(name,arm);armRest.set(name,arm.quaternion.clone());armBase.set(name,arm.quaternion.clone());}}
      makeCostume(bones);
      const headBone=bones.get('head');if(headBone)makeHead(headBone);
      mixer=new THREE.AnimationMixer(gltf.scene);
      for(const clip of gltf.animations)actions.set(clip.name,mixer.clipAction(clip));
      idle=actions.get('idle');idle?.setEffectiveWeight(.4).play();
      mixer.addEventListener('finished',()=>{gesture?.fadeOut(.3);dirty=true;wake();});
      pointToFocus(latest.current.step,latest.current.focusPoint);
      setReady(true);latest.current.onReady?.();dirty=true;frameCamera();wake();
    },undefined,()=>{if(!disposed){broken=true;cancelAnimationFrame(frame);frame=0;setFailed(true);latest.current.onReady?.();}});

    const zAxis=new THREE.Vector3(0,0,1),armRotation=new THREE.Quaternion();
    function draw(now:number) {
      frame=0;if(disposed||broken||document.hidden||!inView)return;
      const {reduced:reduce,speaking:talk}=latest.current;
      if(!reduce&&last&&now-last<1000/30){frame=requestAnimationFrame(draw);return;}
      const delta=last?Math.min((now-last)/1000,.07):0;last=now;
      for(const [name,arm] of armBones){const base=armBase.get(name);if(base)arm.quaternion.copy(base);}
      if(!reduce){elapsed+=delta;mixer?.update(delta);}
      for(const [name,arm] of armBones)armBase.get(name)?.copy(arm.quaternion);
      const blend=reduce?1:1-Math.exp(-Math.max(delta,.016)*9);
      gazeCurrent.lerp(gazeTarget,blend);currentYaw=THREE.MathUtils.lerp(currentYaw,targetYaw,blend);
      root.rotation.y=currentYaw;
      const greetingActive=now<greetingUntil;
      if(greetingActive||pointingSide&&now<activeUntil) {
        const side=greetingActive?1:pointingSide,name=side>0?'arm-left':'arm-right';
        const arm=armBones.get(name),rest=armRest.get(name);
        if(arm&&rest){
          const t=Math.max(0,(now-greetingStart)/1000);
          const envelope=reduce?1:THREE.MathUtils.smoothstep(t,0,.18)*(1-THREE.MathUtils.smoothstep(t,1.95,2.4));
          const angle=greetingActive?(reduce?2.25:envelope*(2.25+.19*Math.sin(t*18))):1.8+gazeTarget.y*.42;
          armRotation.setFromAxisAngle(zAxis,side*angle);arm.quaternion.copy(rest).multiply(armRotation);
        }
      }
      interactive.dataset.handRaised=greetingActive?'true':'false';
      interactive.dataset.yaw=(currentYaw*180/Math.PI).toFixed(1);
      interactive.dataset.gazeX=gazeCurrent.x.toFixed(2);interactive.dataset.gazeY=gazeCurrent.y.toFixed(2);
      if(face) {
        const nod=greetingActive?(reduce ? .065 : Math.sin((now-greetingStart)/180)*.045):0;
        face.rotation.set(-gazeCurrent.y*.10+nod+(reduce?0:Math.sin(elapsed*.65)*.009),gazeCurrent.x*.17+(reduce?0:Math.sin(elapsed*.43)*.012),0);
        const blink=reduce?0:Math.pow(Math.max(0,Math.cos(elapsed*1.65)),38),opening=1-blink*.94;
        for(const gaze of [leftEye,rightEye])if(gaze){gaze.scale.y=opening;gaze.position.x=gazeCurrent.x*.004;gaze.position.y=gazeCurrent.y*.003;}
        for(const white of eyeWhites)white.scale.y=.013*opening;
        for(const lid of [leftLid,rightLid])if(lid){lid.position.y=.012-(1-opening)*.012;lid.scale.y=.003+(1-opening)*.012;}
        if(jaw){jaw.position.y=.082-(!reduce&&talk?(.001+.0015*Math.sin(elapsed*16)):0);jaw.scale.set(greetingActive?1.12:1,!reduce&&talk?1+.2*Math.max(0,Math.sin(elapsed*15)):1,1);}
      }
      if(!reduce||dirty){renderer.render(scene,camera);dirty=false;}
      // Reduced motion has no idle loop, but every direct input renders its new static pose.
      if(!reduce)frame=requestAnimationFrame(draw);
    }
    function wake(){if(!frame&&!disposed&&!broken&&!document.hidden&&inView){last=0;frame=requestAnimationFrame(draw);}}
    function onVisibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else{dirty=true;wake();}}
    let pointer:{id:number;x:number;y:number;startYaw:number;dragging:boolean;vertical:boolean}|null=null;
    function onPointerEnter(event:PointerEvent){hovered=true;gazeTarget.copy(screenGaze({x:event.clientX,y:event.clientY}));dirty=true;wake();}
    function onPointerDown(event:PointerEvent){
      if(event.button!==0||!event.isPrimary)return;
      suppressClick.current=false;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startYaw:targetYaw,dragging:false,vertical:false};
    }
    function onPointerMove(event:PointerEvent){
      hovered=true;gazeTarget.copy(screenGaze({x:event.clientX,y:event.clientY}));
      if(pointer?.id===event.pointerId){
        const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
        if(!pointer.dragging&&Math.abs(dy)>6&&Math.abs(dy)>Math.abs(dx)*1.2)pointer.vertical=true;
        if(!pointer.vertical&&!pointer.dragging&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)*1.1){
          pointer.dragging=true;interactive.setPointerCapture(event.pointerId);interactive.dataset.dragging='true';setReactionCount(n=>n+1);
        }
        if(pointer.dragging){
          if(event.cancelable)event.preventDefault();
          const width=Math.max(100,interactive.getBoundingClientRect().width);
          targetYaw=THREE.MathUtils.clamp(pointer.startYaw+dx/width*.95,-Math.PI/7.2,Math.PI/7.2);
          interactive.dataset.reaction='turning';
        }
      }
      dirty=true;wake();
    }
    function releasePointer(){
      if(pointer&&interactive.hasPointerCapture(pointer.id))interactive.releasePointerCapture(pointer.id);
      pointer=null;interactive.dataset.dragging='false';
    }
    function onPointerUp(event:PointerEvent){if(pointer?.id!==event.pointerId)return;suppressClick.current=pointer.dragging||pointer.vertical;releasePointer();}
    function onPointerCancel(){suppressClick.current=true;releasePointer();hovered=false;gazeTarget.copy(screenGaze(latest.current.focusPoint));dirty=true;wake();}
    function onPointerLeave(){if(pointer?.dragging)return;pointer=null;hovered=false;gazeTarget.copy(screenGaze(latest.current.focusPoint));dirty=true;wake();}
    interactive.addEventListener('pointerenter',onPointerEnter);
    interactive.addEventListener('pointerdown',onPointerDown);
    interactive.addEventListener('pointermove',onPointerMove,{passive:false});
    interactive.addEventListener('pointerup',onPointerUp);
    interactive.addEventListener('pointercancel',onPointerCancel);
    interactive.addEventListener('pointerleave',onPointerLeave);
    const resize=new ResizeObserver(frameCamera);resize.observe(target);
    const intersection=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??true;if(inView){dirty=true;wake();}else{cancelAnimationFrame(frame);frame=0;last=0;}});intersection.observe(target);
    document.addEventListener('visibilitychange',onVisibility);
    renderer.domElement.addEventListener('webglcontextlost',onContextLost);
    function onContextLost(event:Event){event.preventDefault();broken=true;setFailed(true);cancelAnimationFrame(frame);frame=0;}
    frameCamera();wake();
    function disposeObject(object:THREE.Object3D){
      const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
      object.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){mats.add(m);for(const v of Object.values(m))if(v instanceof THREE.Texture)textures.add(v);}}});
      geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());
    }
    return()=>{
      disposed=true;cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',onVisibility);
      releasePointer();interactive.removeEventListener('pointerenter',onPointerEnter);interactive.removeEventListener('pointerdown',onPointerDown);interactive.removeEventListener('pointermove',onPointerMove);interactive.removeEventListener('pointerup',onPointerUp);interactive.removeEventListener('pointercancel',onPointerCancel);interactive.removeEventListener('pointerleave',onPointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost',onContextLost);controller.current=null;
      mixer?.stopAllAction();if(mixer)mixer.uncacheRoot(mixer.getRoot());disposeObject(scene);materials.forEach(m=>m.dispose());sphereGeometry.dispose();shadowTexture.dispose();renderer.dispose();renderer.domElement.remove();
    };
  },[]);

  useEffect(()=>{controller.current?.change(step,reduced,compact,speaking,focusPoint);},[step,reduced,compact,speaking,focusPoint?.x,focusPoint?.y]);
  return <div ref={surface} className={`guide-avatar${compact?' guide-avatar--compact':''}${ready?' is-ready':''}`} role="button" tabIndex={0} aria-label={words.label} title={words.title} aria-keyshortcuts="Enter Space ArrowLeft ArrowRight" data-reaction-count={reactionCount} data-avatar-version="soft-interactive" data-ready={ready?'true':'false'} onClick={event=>{event.stopPropagation();if(suppressClick.current){suppressClick.current=false;return;}event.currentTarget.focus({preventScroll:true});sayHello();}} onKeyDown={event=>{
    if(['Enter',' ','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();}
    if((event.key==='Enter'||event.key===' ')&&!event.repeat)sayHello();
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){controller.current?.turn(event.key==='ArrowLeft'?-Math.PI/18:Math.PI/18);setReactionCount(n=>n+1);}
  }}>
    <div className="guide-avatar__canvas" ref={host}/>
    {(!ready||failed)&&<div className={`guide-avatar__fallback${failed?' is-static':''}`} aria-hidden="true">
      <svg viewBox="0 0 240 300" fill="none">
        <defs><linearGradient id="zholserik-coat" x1="65" y1="200" x2="190" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#235853"/><stop offset="1" stopColor="#103638"/></linearGradient></defs>
        <path d="M24 300 34 247q9-28 55-40h62q46 12 55 40l10 53" fill="url(#zholserik-coat)"/>
        <path d="m95 208 25 48 25-48m-25 48v44" stroke="#c29b5c" strokeWidth="3"/>
        <ellipse cx="120" cy="126" rx="54" ry="72" fill="#c9956d"/>
        <ellipse cx="67" cy="132" rx="9" ry="17" fill="#bc865e"/><ellipse cx="173" cy="132" rx="9" ry="17" fill="#bc865e"/>
        <path d="M75 148q19 13 45 7 26 6 45-7 3 51-45 61-48-10-45-61" fill="#cfcdc1"/>
        <ellipse cx="90" cy="141" rx="16" ry="14" fill="#d3a377"/><ellipse cx="150" cy="141" rx="16" ry="14" fill="#d3a377"/>
        <path d="M84 102q11-6 23-1m26 0q12-5 23 1" stroke="#cfcdc1" strokeWidth="5" strokeLinecap="round"/>
        <ellipse cx="96" cy="119" rx="10" ry="7" fill="#eee6d6"/><ellipse cx="144" cy="119" rx="10" ry="7" fill="#eee6d6"/>
        <circle cx="97" cy="119" r="4.5" fill="#42443b"/><circle cx="143" cy="119" r="4.5" fill="#42443b"/>
        <circle cx="95" cy="117" r="1.4" fill="#fff9e9"/><circle cx="141" cy="117" r="1.4" fill="#fff9e9"/>
        <path d="m119 121-5 18q6 5 12 0" fill="#d3a47c"/>
        <path d="M107 160q13 9 26 0" stroke="#96543d" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="m118 148-15 6m19-6 15 6" stroke="#d4d1c6" strokeWidth="6" strokeLinecap="round"/>
        <path d="M68 89q1-41 52-42 51 1 52 42-52-8-104 0" fill="#164844"/>
        <path d="m84 77 4-5 4 5-4 5m24-5 4-5 4 5-4 5m24-5 4-5 4 5-4 5" stroke="#c09c61" strokeWidth="1.4"/>
      </svg>
      {!failed&&<span className="guide-avatar__loading"/>}
    </div>}
    <span className={'guide-avatar__hint'+(greeting?' is-greeting':'')} aria-hidden="true"><Hand size={14}/><span>{greeting?words.hello:words.hint}</span></span>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true"><span key={reactionCount}>{greeting?words.hello:''}</span></span>
  </div>;
}
