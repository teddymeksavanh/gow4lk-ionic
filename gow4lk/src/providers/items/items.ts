import { Injectable } from '@angular/core';

import { Item } from '../../models/item';
import { Api } from '../api/api';

@Injectable()
export class Items {

  constructor(public api: Api) { }

  query(params?: any) {
    console.log('enter');
    return this.api.get('strolls', params);
  }

  add(item: Item) {
    console.log('item added', item);
  }

  delete(item: Item) {
  }

}
