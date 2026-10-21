import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Home, Layers } from 'lucide-react';
import { L, text, type Lang } from './i18n';
const modelCopy={
  title:L('Архитектура в объёме','Көлемдегі сәулет','Architecture in three dimensions'),
  note:L('Учебная геометрическая схема по описанию и фотографии. Она помогает рассмотреть форму и не является обмерной или археологической реконструкцией.','Сипаттама мен фотоға негізделген оқу геометриялық сызбасы. Ол пішінді зерттеуге көмектеседі; өлшемдік немесе археологиялық реконструкция емес.','An educational geometric study based on a description and photograph. It helps explore the form; it is not a surveyed or archaeological reconstruction.'),
  left:L('Повернуть влево','Солға бұру','Rotate left'),right:L('Повернуть вправо','Оңға бұру','Rotate right'),
  in:L('Приблизить','Жақындату','Zoom in'),out:L('Отдалить','Алыстату','Zoom out'),
  reset:L('Исходный вид','Бастапқы көрініс','Reset view'),wire:L('Контуры','Қырлар','Edges'),
  fail:L('3D недоступно на этом устройстве. Фотография и описание доступны в истории.','Бұл құрылғыда 3D қолжетімсіз. Фото мен сипаттама тарих бетінде бар.','3D is unavailable on this device. The photograph and description remain available in the story.'),
  photo:L('Исходная фотография','Негізгі фотосурет','Source photograph'),
};
export default function ModelView({lang,reduced}:{lang:Lang;reduced:boolean}){
  const host=useRef<HTMLDivElement>(null),actions=useRef<{rotate:(angle:number)=>void;zoom:(factor:number)=>void;reset:()=>void;wire:()=>void}|null>(null);
  const [failed,setFailed]=useState(false),[wire,setWire]=useState(false);
  useEffect(()=>{
    if(!host.current)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch{setFailed(true);return;}
    const target=host.current;
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor('#123b3d');
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    target.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label',text(modelCopy.title,lang));
    const scene=new THREE.Scene();scene.fog=new THREE.Fog('#123b3d',38,78);
    const camera=new THREE.PerspectiveCamera(38,1,.1,120);camera.position.set(19,12,21);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,4.5,0);controls.enableDamping=!reduced;controls.dampingFactor=.08;controls.minDistance=13;controls.maxDistance=42;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=false;
    scene.add(new THREE.HemisphereLight('#e0e6da','#4d4936',2.5));
    const light=new THREE.DirectionalLight('#ffe2ad',4);light.position.set(-10,20,12);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-15,right:15,top:15,bottom:-15});light.shadow.bias=-.0003;scene.add(light);
    const rim=new THREE.DirectionalLight('#98c7c4',2);rim.position.set(10,12,-9);scene.add(rim);
    const group=new THREE.Group();scene.add(group);
    const positions:number[]=[],colors:number[]=[],indices:number[]=[];
    const rings=45,sides=48;
    function profile(t:number){return t<.24?1-t*.1:Math.max(.025,Math.pow((1-t)/.76,.72)*.976);}
    for(let row=0;row<=rings;row++){
      const t=row/rings,y=t*11.5,r=3.55*profile(t);
      for(let j=0;j<sides;j++){
        const a=j/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
        const x=Math.sign(c)*Math.pow(Math.abs(c),.42)*r,z=Math.sign(s)*Math.pow(Math.abs(s),.42)*r;
        positions.push(x,y+.15,z);
        const variation=.85+.14*Math.sin(row*18.3+j*7.7)*Math.sin(j*2.1+row*.9);
        colors.push(.64*variation,.47*variation,.31*variation);
      }
    }
    for(let row=0;row<rings;row++)for(let j=0;j<sides;j++){
      const n=(j+1)%sides,a=row*sides+j,b=row*sides+n,c=(row+1)*sides+j,d=(row+1)*sides+n;
      const x=(positions[a*3]+positions[b*3])/2,z=(positions[a*3+2]+positions[b*3+2])/2;
      if(row<8&&z>3.2&&Math.abs(x)<.8)continue;
      indices.push(a,c,b,b,c,d);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,side:THREE.DoubleSide});
    const building=new THREE.Mesh(geometry,material);building.castShadow=true;building.receiveShadow=true;group.add(building);
    const interior=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.4,.12),new THREE.MeshStandardMaterial({color:'#1b1813',roughness:1}));interior.position.set(0,1.3,3.05);group.add(interior);
    const foundation=new THREE.Mesh(new THREE.BoxGeometry(7.7,.3,7.7),new THREE.MeshStandardMaterial({color:'#bfa47b',roughness:1}));foundation.position.y=0;foundation.receiveShadow=true;group.add(foundation);
    const ground=new THREE.Mesh(new THREE.CircleGeometry(30,96),new THREE.MeshStandardMaterial({color:'#79765c',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.18;ground.receiveShadow=true;scene.add(ground);
    let dirty=true,frame=0;
    controls.addEventListener('change',()=>{dirty=true;});
    function size(){const rect=target.getBoundingClientRect();if(!rect.width||!rect.height)return;camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height);dirty=true;}
    const observer=new ResizeObserver(size);observer.observe(target);size();controls.update();
    actions.current={
      rotate:angle=>{group.rotation.y+=angle;dirty=true;},
      zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();dirty=true;},
      reset:()=>{camera.position.set(19,12,21);group.rotation.y=0;controls.update();dirty=true;},
      wire:()=>{material.wireframe=!material.wireframe;dirty=true;}
    };
    function render(){frame=requestAnimationFrame(render);const moved=controls.update();if((dirty||moved)&&!document.hidden){renderer.render(scene,camera);dirty=false;}}
    render();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();actions.current=null;scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const ms=Array.isArray(obj.material)?obj.material:[obj.material];ms.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  },[lang,reduced]);
  return <div className="model-layout"><div className="model-stage"><div className="model-canvas" ref={host}/>{failed&&<p className="model-failed">{text(modelCopy.fail,lang)}</p>}<div className="model-controls">{[{key:'left',icon:<RotateCcw size={18}/>,run:()=>actions.current?.rotate(-Math.PI/6)},{key:'right',icon:<RotateCw size={18}/>,run:()=>actions.current?.rotate(Math.PI/6)},{key:'in',icon:<ZoomIn size={18}/>,run:()=>actions.current?.zoom(.9)},{key:'out',icon:<ZoomOut size={18}/>,run:()=>actions.current?.zoom(1.1)},{key:'reset',icon:<Home size={18}/>,run:()=>actions.current?.reset()}].map(v=><button key={v.key} className="icon-button" onClick={v.run} title={text(modelCopy[v.key as keyof typeof modelCopy],lang)} aria-label={text(modelCopy[v.key as keyof typeof modelCopy],lang)}>{v.icon}</button>)}<button className="icon-button" onClick={()=>{actions.current?.wire();setWire(!wire);}} aria-pressed={wire} title={text(modelCopy.wire,lang)} aria-label={text(modelCopy.wire,lang)}><Layers size={18}/></button></div></div><aside className="model-description"><h3>{text(modelCopy.title,lang)}</h3><p>{text(modelCopy.note,lang)}</p><img src={import.meta.env.BASE_URL+'media/kozy.jpg'} alt={text(modelCopy.photo,lang)}/><a href="https://commons.wikimedia.org/wiki/File:Kozy_Korpesh_%E2%80%94_Bayan_Sulu_mausoleum.JPG" target="_blank" rel="noreferrer">{text(modelCopy.photo,lang)} · Mikhail Antonov / Xeofox · CC BY-SA 4.0</a></aside></div>;
}
