import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// import { Item } from '../../models/item';
import { Items, User, Api } from '../../providers';
import { Observable } from '../../../node_modules/rxjs';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  currentItems: any = [];
  user: any;
  baseApiUrl;
  result: any;
  constructor(public apiService: Api, public navCtrl: NavController, public navParams: NavParams, public items: Items, public userService: User) {
    this.baseApiUrl = this.apiService.url + '/';
    this.userService
    .getMe()
    .subscribe((res: any) => {
      if (res) this.user = res;
    });

    Observable
      .forkJoin(
        this.items.queryAll(),
        this.userService.queryAll()
      )
      .subscribe(result => {
        console.log('result', result);
        this.result = result[0];
        this.result = this.result.concat(result[1]);
      });
  }

  ionViewWillEnter() {
    Observable
      .forkJoin(
        this.items.queryAll(),
        this.userService.queryAll()
      )
      .subscribe(result => {
        console.log('result', result);

        this.result = result[0];
        this.result = this.result.concat(result[1]);
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
    
    if(this.result && val) {
      this.currentItems = this.result.filter(r => {
        if(r && r.city && r.city.toLowerCase().includes(val.toLowerCase())) {
          return true;
        }
        if(r && r.name && r.name.toLowerCase().includes(val.toLowerCase())) {
          return true;
        }
        return false;
      });
    }
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(opener: any) {
    let datas = {};
    let openerKeys = Object.keys(opener);
    let isUser = openerKeys.find(k => k === 'admin');

    if(isUser) {
      datas['user'] = opener;
    } else {
      datas['item'] = opener;
      datas['user'] = this.user || null;
    }
  
    if(isUser) {
      this.navCtrl.push('UserCardPage', datas);
    } else {
      this.navCtrl.push('ItemDetailPage', datas);
    }
  }

}
