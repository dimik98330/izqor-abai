// A permission prompt can resolve after its screen has gone away.
// Never hand such a stream to a recorder, and release the microphone immediately.
export async function requestRecordingStream(
  acquire:()=>Promise<MediaStream>,
  isCurrent:()=>boolean,
):Promise<MediaStream|null>{
  const stream=await acquire();
  if(isCurrent())return stream;
  stream.getTracks().forEach(track=>track.stop());
  return null;
}
