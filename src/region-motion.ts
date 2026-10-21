export const regionMotion = { cameraDuration: 680, focusScale: .85, focusWeight: .4 } as const;
export const cameraEase = (progress: number) => progress * progress * (3 - 2 * progress);
