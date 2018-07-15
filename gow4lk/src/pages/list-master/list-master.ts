import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items, User, Comments, Notes } from '../../providers';

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
  currentItems: any[] = [];
  currentStrolls: any[] = [];
  items: any[] = [];
  user: any;
  item: any;
  isReadyToSave: boolean;

  commentForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public itemService: Items,
    navParams: NavParams,
    public commentsService: Comments,
    public formBuilder: FormBuilder,
    public notesService: Notes,
    public modalCtrl: ModalController,
    public userService: User
  ) {
    if(navParams.get('item')) {
      console.log("navParams.get('item')", navParams.get('item'));
      this.currentItems.push(navParams.get('item'));
    }

    this.userService
      .getMe()
      .subscribe((res: any) => {
        if (res) this.user = res;
      });

    this.itemService
      .queryAll()
      .subscribe((res: any) => {
        if (res) this.items = res;
        this.currentItems = res;
      }, err => {
        console.error('ERROR', err);
      });

    this.commentForm = formBuilder.group({
      description: ['']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewWillEnter() {
    this.commentForm = this.formBuilder.group({
      description: ['']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('PathCreatePage');
    // let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      if (item) {
        console.log('enter noob');
        // this.itemService
        //     .create(item)
        //     .subscribe(res => {
        //       if (res) this.items.push(res);
        //       console.log('subscribed', res);
        //     });
        // this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    // this.items.delete(item);
  }

  updateList(ev) {
    console.log('ev', ev);
  }

  publish(item: any) {
    console.log('publier');
    if(!this.commentForm.valid) { return; }
    console.log('this.commentForm', this.commentForm.value);
    if(item && item.id) {
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          console.log('com', com);
        });
    }
    // this.commentsService.createComment()
  }

  checkComments(item: any) {
    console.log('check', item);
    if(item && item.id) {
      console.log('check 1');
      this.commentsService
        .getComments(item.id)
        .subscribe(allCom => {
          let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: allCom});
          // let addModal = this.modalCtrl.create('ItemCreatePage');
          addModal.onDidDismiss(item => {
            if (item) {
              console.log('Item Comments Page', item);
              // this.itemService
              //     .create(item)
              //     .subscribe(res => {
              //       if (res) this.items.push(res);
              //       console.log('subscribed', res);
              //     });
              // this.items.add(item);
            }
          })
          addModal.present();
        });
    }
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
