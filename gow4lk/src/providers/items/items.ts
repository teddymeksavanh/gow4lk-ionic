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
    console.log('item in post', item);
    return this.api.post('strolls', item);
  }

  delete(item: Item) {
  }

}
