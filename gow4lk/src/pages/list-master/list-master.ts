import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, ModalController, NavController, NavParams, ToastController } from 'ionic-angular';

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
    public notesService: Notes,
    public toastCtrl: ToastController
  ) {
    if(navParams.get('item')) {
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
        this.currentItems.map(ci => {
          if(ci && ci.id) {
            if(ci && ci.created_by) {
              this.userService
                .getUser(ci.created_by)
                .subscribe(userStroll => {
                  ci['user'] = userStroll;
                });
            }

            this.commentsService
                .getComments(ci.id)
                .subscribe( cmts => {
                  if(cmts) {
                    if(cmts && cmts.length > 0) {
                      cmts.map(ac => {
                        if(ac && ac.created_by) {
                          this.userService
                            .getUser(ac.created_by)
                            .subscribe(usr => {
                              if (usr) ac['user'] = usr;
                          });
                        }
                      });
                      ci['comments'] = cmts;
                    }
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

    this.commentForm = formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || '']
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
      created_by: [this.user && this.user.id || '']
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
        this.currentItems = res;
        this.currentItems.map(ci => {
          if(ci && ci.id) {

            if(ci && ci.created_by) {
              this.userService
                .getUser(ci.created_by)
                .subscribe(userStroll => {
                  ci['user'] = userStroll;
                });
            }

            this.commentsService
                .getComments(ci.id)
                .subscribe( cmts => {
                  if(cmts) {
                    if(cmts && cmts.length > 0) {
                      cmts.map(ac => {
                        if(ac && ac.created_by) {
                          this.userService
                            .getUser(ac.created_by)
                            .subscribe(usr => {
                              if (usr) ac['user'] = usr;
                          });
                        }
                      });
                      ci['comments'] = cmts;
                    }
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
      console.log('this', this);
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
    this.commentForm.get('created_by').setValue(this.user && this.user.id && this.user.id.toString() || null);
    if(!this.commentForm.valid) { return; }
    if(item && item.id && this.commentForm.get('description').value && this.commentForm.get('created_by').value) {
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          this.commentForm.get('description').setValue(null);
          this.refetch();
          // console.log('com', com);this.comm
        });
    } else {
      const toast = this.toastCtrl.create({
        message: 'Votre commentaire est vide !',
        duration: 3000
      });
      toast.present();
    }
  }

  checkComments(item: any) {
    if(item && item.id) {
      if(this.currentItems.find(cui => cui && cui.id && cui.id == item.id)) {
        let stroll = this.currentItems.find(cui => cui && cui.id && cui.id == item.id);
        if(stroll['comments'] && stroll['comments'].length && stroll['comments'].length > 0) {
          let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: stroll['comments'], user: this.user});
          addModal.onDidDismiss(item => {
            this.refetch();
          })
          addModal.present();
        }

      }
      // this.commentsService
      //   .getComments(item.id)
      //   .subscribe(allCom => {
      //     if(allCom && allCom.length && allCom.length > 0) {
      //       allCom.map(ac => {
      //         if(ac && ac.created_by) {
      //           this.userService
      //             .getUser(ac.created_by)
      //             .subscribe(usr => {
      //               if (usr) ac['user'] = usr;
      //           });
      //         }
      //       });
      //     }
      //     if(allCom && allCom.length && allCom.length > 0) {
      //       let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: allCom, user: this.user});
      //       addModal.onDidDismiss(item => {
      //         this.refetch();
      //         console.log('closeModal', item);
      //       })
      //       addModal.present();
      //     }
      //   });
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
