import * as THREE from 'three';
import { REGION_CENTRE, projectCoordinate, type Coordinate } from './region-geometry';
import type { ElevationGrid } from './region-terrain';
const BASE_HEIGHT=.28, METRE_SCALE=.00028;
const LON_SCALE=Math.cos(REGION_CENTRE[1]*Math.PI/180)*1.8;
export function geographicPosition(x:number,northing:number):Coordinate{return[REGION_CENTRE[0]+x/LON_SCALE,REGION_CENTRE[1]+northing/1.8];}
/** The same NE–SW triangles as the rendered grid; marker and wall heights agree. */
export function surfaceMetres(grid:ElevationGrid|null,[lon,lat]:Coordinate):number{
  if(!grid||grid.width<2||grid.height<2||grid.elevations.length!==grid.width*grid.height)return NaN;
  const [w,s,e,n]=grid.bbox,x=Math.max(0,Math.min(grid.width-1,(lon-w)/(e-w)*(grid.width-1))),y=Math.max(0,Math.min(grid.height-1,(n-lat)/(n-s)*(grid.height-1)));
  const ix=Math.min(grid.width-2,Math.floor(x)),iy=Math.min(grid.height-2,Math.floor(y)),u=x-ix,v=y-iy;
  const a=grid.elevations[iy*grid.width+ix],b=grid.elevations[iy*grid.width+ix+1],c=grid.elevations[(iy+1)*grid.width+ix],d=grid.elevations[(iy+1)*grid.width+ix+1];
  return u+v<=1?a*(1-u-v)+b*u+c*v:b*(1-v)+c*(1-u)+d*(u+v-1);
}
export function surfaceHeight(grid:ElevationGrid|null,p:Coordinate):number{
  const m=surfaceMetres(grid,p);return BASE_HEIGHT+(Number.isFinite(m)?Math.max(0,m-100)*METRE_SCALE:0);
}
export function surfaceBounds(rings:Coordinate[][],grid:ElevationGrid|null):[number,number,number,number]{
  if(grid)return grid.bbox;
  return[Math.min(...rings[0].map(p=>p[0])),Math.min(...rings[0].map(p=>p[1])),Math.max(...rings[0].map(p=>p[0])),Math.max(...rings[0].map(p=>p[1]))];
}
/** Fixed-size terrain mesh. The geographical material mask provides the exact visible outline. */
export function regionalSurface(rings:Coordinate[][],grid:ElevationGrid|null){
  const [west,south,east,north]=surfaceBounds(rings,grid),width=grid?.width??96,height=grid?.height??128;
  const positions:number[]=[],colors:number[]=[],faces:number[]=[],heights:number[]=[];
  const low=new THREE.Color('#365f54'),middle=new THREE.Color('#729174'),high=new THREE.Color('#c0b294'),color=new THREE.Color();
  for(let row=0;row<height;row++)for(let col=0;col<width;col++){
    const coordinate:Coordinate=[west+(east-west)*col/(width-1),north-(north-south)*row/(height-1)];
    const [x,y]=projectCoordinate(coordinate),m=surfaceMetres(grid,coordinate),elevation=Number.isFinite(m)?m:300;
    positions.push(x,surfaceHeight(grid,coordinate),-y);heights.push(elevation);
    if(elevation<900)color.copy(low).lerp(middle,Math.max(0,(elevation-150)/750));else color.copy(middle).lerp(high,Math.min(1,(elevation-900)/1700));
    colors.push(color.r,color.g,color.b);
    if(row<height-1&&col<width-1){const a=row*width+col,b=a+1,c=a+width,d=c+1;faces.push(a,c,b,b,c,d);}
  }
  const surface=new THREE.BufferGeometry();surface.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));surface.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));surface.setIndex(faces);surface.computeVertexNormals();
  const contourPositions:number[]=[];
  if(grid)for(let i=0;i<faces.length;i+=3){
    const t=faces.slice(i,i+3),min=Math.min(...t.map(n=>heights[n])),max=Math.max(...t.map(n=>heights[n]));
    for(let level=Math.ceil(min/250)*250;level<max;level+=250){
      const hits:number[][]=[];
      for(let edge=0;edge<3;edge++){
        const a=t[edge],b=t[(edge+1)%3];if((heights[a]<level)===(heights[b]<level))continue;
        const p=(level-heights[a])/(heights[b]-heights[a]);
        hits.push([0,1,2].map(axis=>positions[a*3+axis]+(positions[b*3+axis]-positions[a*3+axis])*p+(axis===1?.006:0)));
      }
      if(hits.length===2)contourPositions.push(...hits[0],...hits[1]);
    }
  }
  const contours=new THREE.BufferGeometry();contours.setAttribute('position',new THREE.Float32BufferAttribute(contourPositions,3));
  const wallPositions:number[]=[],outlines:THREE.Vector3[][]=[];
  for(const ring of rings){
    const outline:THREE.Vector3[]=[];
    for(let i=1;i<ring.length;i++){
      const a=ring[i-1],b=ring[i],pa=projectCoordinate(a),pb=projectCoordinate(b),steps=Math.max(1,Math.ceil(Math.hypot(pb[0]-pa[0],pb[1]-pa[1])/.04));
      for(let j=0;j<steps;j++){const p:Coordinate=[a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps];const[x,y]=projectCoordinate(p);outline.push(new THREE.Vector3(x,surfaceHeight(grid,p),-y));}
    }
    if(outline.length)outline.push(outline[0].clone());outlines.push(outline);
    for(let i=1;i<outline.length;i++){const a=outline[i-1],b=outline[i];wallPositions.push(a.x,a.y,a.z,b.x,b.y,b.z,b.x,-.07,b.z,a.x,a.y,a.z,b.x,-.07,b.z,a.x,-.07,a.z);}
  }
  const walls=new THREE.BufferGeometry();walls.setAttribute('position',new THREE.Float32BufferAttribute(wallPositions,3));walls.computeVertexNormals();
  return{surface,contours,walls,outlines};
}

