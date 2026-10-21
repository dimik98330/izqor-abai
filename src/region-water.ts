import * as THREE from 'three';
import {projectCoordinate,type Coordinate} from './region-geometry';
export interface RegionWater{features:{geometry:{type:'Polygon'|'LineString';coordinates:number[][]|number[][][]}}[];}
/** R=land, G=water. Draw geographical data once, never create a mesh per lake. */
export function regionMask(polygons:Coordinate[][][],data:RegionWater|null,bbox:[number,number,number,number]){
  const size=1024,[west,south,east,north]=bbox;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const context=canvas.getContext('2d');if(!context)throw new Error('Geographic mask unavailable');
  const point=([x,y]:Coordinate):Coordinate=>[(x-west)/(east-west)*size,(north-y)/(north-south)*size];
  function ring(coords:Coordinate[]){coords.forEach((p,i)=>{const[x,y]=point(p);if(i)context!.lineTo(x,y);else context!.moveTo(x,y);});context!.closePath();}
  context.fillStyle='#fff';context.beginPath();for(const rings of polygons)for(const coords of rings)ring(coords);context.fill('evenodd');
  const land=context.getImageData(0,0,size,size).data;
  context.clearRect(0,0,size,size);context.fillStyle='#fff';context.strokeStyle='#fff';context.lineWidth=1.9;context.lineJoin='round';context.lineCap='round';
  for(const feature of data?.features??[]){
    context.beginPath();
    if(feature.geometry.type==='Polygon'){for(const coords of feature.geometry.coordinates as Coordinate[][])ring(coords);context.fill('evenodd');}
    else{(feature.geometry.coordinates as Coordinate[]).forEach((p,i)=>{const[x,y]=point(p);if(i)context.lineTo(x,y);else context.moveTo(x,y);});context.stroke();}
  }
  const water=context.getImageData(0,0,size,size).data,combined=new Uint8Array(size*size*4);
  for(let i=0;i<combined.length;i+=4){combined[i]=land[i];combined[i+1]=water[i];combined[i+3]=255;}
  const texture=new THREE.DataTexture(combined,size,size,THREE.RGBAFormat);texture.flipY=true;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
  canvas.width=canvas.height=0;
  const [x0,y0]=projectCoordinate([west,south]),[x1,y1]=projectCoordinate([east,north]);
  return{texture,bounds:new THREE.Vector4(x0,y0,x1-x0,y1-y0)};
}
export function applyRegionMask(material:THREE.Material,mask:ReturnType<typeof regionMask>,water:boolean){
  material.onBeforeCompile=shader=>{
    shader.uniforms.regionMask={value:mask.texture};shader.uniforms.regionBounds={value:mask.bounds};shader.uniforms.regionWaterColor={value:new THREE.Color('#6da4a1')};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform vec4 regionBounds;\nvarying vec2 vRegionUv;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvRegionUv=(vec2(position.x,-position.z)-regionBounds.xy)/regionBounds.zw;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D regionMask;\nuniform vec3 regionWaterColor;\nvarying vec2 vRegionUv;')
      .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nvec4 regionSample=texture2D(regionMask,vRegionUv);\nif(regionSample.r<0.5)discard;'+(water?'':'\nif(regionSample.g>0.3)discard;'));
    if(water)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,regionWaterColor,regionSample.g);');
  };
  material.customProgramCacheKey=()=>water?'izqor-land-water-v3':'izqor-contours-v3';
}

