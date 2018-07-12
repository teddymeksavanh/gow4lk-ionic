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

  create(item: Item) {
    return this.api.post('strolls', item);
  }

  createPath(paths: any, strollId: number) {
    return this.api.post(`strolls/${strollId}/paths`, paths);
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

  deleteStroll(strollId: number) {
    return this.api.delete(`strolls/${strollId}`);
  }
}
