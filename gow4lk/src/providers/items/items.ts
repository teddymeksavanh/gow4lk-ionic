import { Injectable } from '@angular/core';

import { Item } from '../../models/item';
import { Api } from '../api/api';

@Injectable()
export class Items {

  constructor(public api: Api) { }

  query(params?: any) {
    return this.api.get('strolls', params);
  }

  queryAll(params?: any) {
    return this.api.get('alls', params);
  }

  // queryAllAdmin(params?: any) {
  //   return this.api.get('allsforce', params);
  // }

  create(item: Item) {
    return this.api.post('strolls', item);
  }

  createPath(paths: any, strollId: number) {
    return this.api.post(`strolls/${strollId}/paths`, paths);
  }

  getStroll(strollId: number) {
    return this.api.get(`strolls/${strollId}`);
  }

  updateStroll(stroll: any, strollId: number) {
    return this.api.put(`strolls/${strollId}`, stroll);
  }

  getPaths(strollId: number) {
    return this.api.get(`strolls/${strollId}/paths`);
  }

  deletePath(strollId: number, pathId: number) {
    return this.api.delete(`strolls/${strollId}/paths/${pathId}`);
  }

  deleteAllPaths(strollId: number) {
    return this.api.delete(`strolls/${strollId}/pathsdelete`);
  }

  updatePath(strollId: number, pathId: number, data: any) {
    return this.api.put(`strolls/${strollId}/paths/${pathId}`, data);
  }

  deleteStroll(strollId: number) {
    return this.api.delete(`strolls/${strollId}`);
  }

  // getTypes(strollId: number) {
  //   return this.api.get(`strolls/${strollId}/types`);
  // }

  // getAllTypes() {
  //   return this.api.get(`types`);
  // }

  // addType(type) {
  //   return this.api.post(`types`, type);
  // }

  // addStrollType(strollId: number, type: any) {
  //   return this.api.post(`types/stroll/${strollId}`, type);
  // }

  // deleteStrollType(strollId: number, typo) {
  //   return this.api.delete(`types/${typo.id}/stroll/${strollId}`);
  // }

  // deleteType(typeId: number) {
  //   return this.api.delete(`types/${typeId}`);
  // }

  /**
   * TYPES
   */
  getTypes() {
    return this.api.get(`types`);
  }

  getType(typeId: number) {
    return this.api.get(`types/${typeId}`);
  }

  updateType(typeId: number, type) {
    return this.api.put(`types/${typeId}`, type);
  }

  createType(type) {
    return this.api.post(`types`, type);
  }

  deleteType(typeId: number) {
    return this.api.delete(`types/${typeId}`);
  }

  /**
   * STROLLS TYPES
   */
  getStrollTypes(strollId: number) {
    return this.api.get(`strolls/${strollId}/types`);
  }

  getStrollType(strollId: number, typeId: number) {
    return this.api.get(`strolls/${strollId}/types/${typeId}`);
  }

  updateStrollType(strollId: number, typeId: number, type) {
    return this.api.put(`strolls/${strollId}/types/${typeId}`, type);
  }

  createStrollType(strollId: number, type) {
    let typeId = type && type.id && {type_id: type.id};
    return this.api.post(`strolls/${strollId}/types`, typeId);
  }

  deleteStrollType(strollId: number, typeId: number) {
    return this.api.delete(`strolls/${strollId}/types/${typeId}`);
  }
}
