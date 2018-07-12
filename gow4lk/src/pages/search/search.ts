import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items, User } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  currentItems: any = [];
  user: any;
  result: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public items: Items, public userService: User) {
    this.userService
    .getMe()
    .subscribe((res: any) => {
      if (res) this.user = res;
    });

    this.items
    .queryAll()
    .subscribe(res => {
      this.result = res;
    });
  }

  /**
   * Perform a service for the proper items.
   */
  getItems(ev) {
    let val = ev.target.value;
    if (!val || !val.trim()) {
      this.currentItems = [];
      return;
    }
    
    this.currentItems = this.result.filter(r => {
      if(r && r.name && r.name.toLowerCase().includes(val)) {
        return true;
      }
      return false;
    });
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item,
      user: this.user || null
    });
  }

}
