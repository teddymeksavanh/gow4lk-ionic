import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html',
  styles: [`
    .list-ion-car {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }
    
    .list-button {
        padding-left: 0 !important;
    }
    
    item-inner {
        padding-right: 0 !important;
    }
    
    ion-label {
        margin: 0 !important;
    }
  `]
})
export class ListMasterPage {
  currentItems: Item[];
  currentStrolls: any[];

  constructor(
    public navCtrl: NavController,
    public items: Items,
    public modalCtrl: ModalController
  ) {
    console.log('query', this.items.query());
    this.items
      .query()
      .subscribe((res: any) => {
        console.log('res', res);
      }, err => {
        console.error('ERROR', err);
      });
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    console.log('current', this);
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      console.log('enter');
      if (item) {
        console.log('create item');
        this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }
}
