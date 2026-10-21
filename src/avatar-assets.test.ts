import { expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

it('ships every external file referenced by the guide GLB',()=>{
  const modelPath=resolve('public/models/guide-base.glb');
  const binary=readFileSync(modelPath);
  const jsonLength=binary.readUInt32LE(12);
  const model=JSON.parse(binary.subarray(20,20+jsonLength).toString('utf8')) as {
    images?:{uri?:string}[]; buffers?:{uri?:string}[];
  };
  for(const resource of [...model.images||[],...model.buffers||[]]){
    if(!resource.uri||resource.uri.startsWith('data:'))continue;
    const asset=resolve(dirname(modelPath),decodeURIComponent(resource.uri));
    expect(existsSync(asset),`Missing guide dependency: ${resource.uri}`).toBe(true);
  }
});
