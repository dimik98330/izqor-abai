import { expect, it, vi } from 'vitest';
import { requestRecordingStream } from './capture';

it('releases a microphone permission granted after the recording screen is gone',async()=>{
  let mounted=true;
  let grant!:(stream:MediaStream)=>void;
  const stop=vi.fn();
  const stream={getTracks:()=>[{stop}]} as unknown as MediaStream;
  const permission=new Promise<MediaStream>(resolve=>{grant=resolve;});
  const result=requestRecordingStream(()=>permission,()=>mounted);
  mounted=false;
  grant(stream);
  expect(await result).toBeNull();
  expect(stop).toHaveBeenCalledOnce();
});

it('keeps the microphone available to a screen that is still open',async()=>{
  const stop=vi.fn();
  const stream={getTracks:()=>[{stop}]} as unknown as MediaStream;
  expect(await requestRecordingStream(async()=>stream,()=>true)).toBe(stream);
  expect(stop).not.toHaveBeenCalled();
});
