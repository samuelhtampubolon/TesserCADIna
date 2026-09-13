import * as THREE from 'three';
import {
  booleanTriangles, trianglesToPolygons, polygonsToTriangles, TRI_BUDGET,
} from './csg-core.js';

export { TRI_BUDGET };

export function geometryToTriangles(geometry) {
  let geo = geometry;
  if (geo.index) geo = geo.toNonIndexed();
  if (!geo.attributes.normal) { geo = geo.clone(); geo.computeVertexNormals(); }
  const pos = geo.attributes.position.array;
  const nrm = geo.attributes.normal.array;
  return {
    position: pos instanceof Float32Array ? pos.slice() : new Float32Array(pos),
    normal: nrm instanceof Float32Array ? nrm.slice() : new Float32Array(nrm),
  };
}

export function trianglesToGeometry({ position, normal }) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(position, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

export function operandsToArrays(operands) {
  return operands.map(o => ({
    ...geometryToTriangles(o.geometry),
    matrix: o.matrix ? Array.from(o.matrix.elements) : null,
  }));
}

export function geometryToPolygons(geometry, matrix = null) {
  const { position, normal } = geometryToTriangles(geometry);
  return trianglesToPolygons(position, normal, matrix ? Array.from(matrix.elements) : null);
}

export function polygonsToGeometry(polys) {
  return trianglesToGeometry(polygonsToTriangles(polys));
}

export function booleanGeometries(op, operands) {
  if (!operands.length) return new THREE.BufferGeometry();
  return trianglesToGeometry(booleanTriangles(op, operandsToArrays(operands)));
}
