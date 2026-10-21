import { Box3, MathUtils, PerspectiveCamera, Vector3 } from 'three';

// Initial view matched to the user's reference: Semey in the near right corner.
export const REGION_OVERVIEW_DIRECTION = [.549, .54, -.638] as const;

/** Fit the visible outline in screen space, including perspective foreshortening.
 * A world-space box centre alone leaves an irregular peninsula far below centre.
 */
export function frameRegion(camera: PerspectiveCamera, points: Vector3[], target: Vector3, direction: Vector3) {
  const bounds = new Box3().setFromPoints(points);
  bounds.getCenter(target);
  const bearing = direction.clone().normalize();
  let distance = bounds.getSize(new Vector3()).length() * 1.6;
  camera.updateProjectionMatrix();
  for (let pass = 0; pass < 12; pass++) {
    camera.position.copy(target).addScaledVector(bearing, distance);
    camera.lookAt(target); camera.updateMatrixWorld();
    const projected = points.map(point => point.clone().project(camera));
    const left = Math.min(...projected.map(p => p.x)), right = Math.max(...projected.map(p => p.x));
    const bottom = Math.min(...projected.map(p => p.y)), top = Math.max(...projected.map(p => p.y));
    const halfHeight = distance * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const horizontal = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const vertical = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    target.addScaledVector(horizontal, (left + right) / 2 * halfHeight * camera.aspect);
    target.addScaledVector(vertical, (top + bottom) / 2 * halfHeight);
    distance *= Math.max((right - left) / 1.78, (top - bottom) / 1.78);
  }
  camera.position.copy(target).addScaledVector(bearing, distance);
  camera.lookAt(target); camera.updateMatrixWorld();
  return distance;
}
