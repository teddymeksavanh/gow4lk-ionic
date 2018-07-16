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
  alreadyLiked: boolean = false;
  colored: any = 'dark';
  item: any;
  isReadyToSave: boolean;

  commentForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public itemService: Items,
    navParams: NavParams,
    public commentsService: Comments,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public userService: User,
    public notesService: Notes
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
        console.log(' if');
        this.currentItems = res;
        this.currentItems.map(ci => {
          console.log('of');
          if(ci && ci.id) {
            this.commentsService
                .getComments(ci.id)
                .subscribe( cmts => {
                  if(cmts) {
                    ci['comments'] = cmts;
                  }
                });

              this.notesService
                .getNotes(ci.id)
                .subscribe( nts => {
                  if(nts) {
                    if(this.user && this.user.id) {
                      if(nts.find(n => n.created_by == this.user.id)) {
                        this.alreadyLiked = true;
                        this.colored = 'primary';
                      } else {
                        this.alreadyLiked = false;
                        this.colored = 'dark';
                      }
                    }
                    ci['notes'] = nts;
                  }
                });
          }
          console.log('ci', ci);
        });
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
    this.refetch();
    this.commentForm = this.formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || null]
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  refetch() {
    this.userService
      .getMe()
      .subscribe((res: any) => {
        if (res) this.user = res;
      });

    this.itemService
      .queryAll()
      .subscribe((res: any) => {
        if (res) this.items = res;
        console.log(' if');
        this.currentItems = res;
        this.currentItems.map(ci => {
          console.log('of');
          if(ci && ci.id) {
            this.commentsService
                .getComments(ci.id)
                .subscribe( cmts => {
                  if(cmts) {
                    console.log('3', cmts);
                    ci['comments'] = cmts;
                  }
                });

              this.notesService
                .getNotes(ci.id)
                .subscribe( nts => {
                  if(nts) {
                    if(this.user && this.user.id) {
                      if(nts.find(n => n.created_by == this.user.id)) {
                        this.alreadyLiked = true;
                        this.colored = 'primary';
                      } else {
                        this.alreadyLiked = false;
                        this.colored = 'dark';
                      }
                    }
                    ci['notes'] = nts;
                  }
                });
          }
        });
      }, err => {
        console.error('ERROR', err);
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
    console.log('publier', this);
    this.commentForm.get('created_by').setValue(this.user && this.user.id && this.user.id.toString() || null);
    if(!this.commentForm.valid) { return; }
    console.log('this.commentForm', this.commentForm.value);
    if(item && item.id) {
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          console.log('com', com);
          this.commentForm.get('description').setValue(null);
          console.log('this', this);
          this.refetch();
          // console.log('com', com);this.comm
        });
    }
  }

  checkComments(item: any) {
    console.log('check', item);
    if(item && item.id) {
      console.log('check 1');
      this.commentsService
        .getComments(item.id)
        .subscribe(allCom => {
          if(allCom) {            
            let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: allCom, user: this.user});
            // let addModal = this.modalCtrl.create('ItemCreatePage');
            addModal.onDidDismiss(item => {
              this.refetch();
              console.log('closeModal', item);
                // this.itemService
                //     .create(item)
                //     .subscribe(res => {
                //       if (res) this.items.push(res);
                //       console.log('subscribed', res);
                //     });
                // this.items.add(item);
            })
            addModal.present();
          }
        });
    }
  }

  addNotes(item: any) {
    if(item && item.id && this.user && this.user.id && !this.alreadyLiked) {
      this.notesService
          .createNote({description: '1', created_by: this.user.id}, item.id)
          .subscribe(no => {
            console.log('no', no);
            this.refetch();
          });
    } else {
      if(this.user && this.user.id && item && item.notes && item.notes.length > 0) {
        let userNote = item.notes.find(n => n.created_by == this.user.id);
        if(userNote && userNote.id) {
          this.notesService
              .deleteNote(item.id, userNote.id)
              .subscribe(no => {
                console.log('no', no);
                this.refetch();
              });
        }
      }
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
