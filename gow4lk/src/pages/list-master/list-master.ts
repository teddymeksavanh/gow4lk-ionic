import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, ModalController, NavController, NavParams, ToastController } from 'ionic-angular';

declare const google: any;
import { Item } from '../../models/item';
import { Items, User, Comments, Notes } from '../../providers';
import { Observable } from 'rxjs';
import { removeSummaryDuplicates } from '@angular/compiler';

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

  users: any;
  comments: any;
  notes: any;

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

    Observable
      .forkJoin(
        this.userService.getMe(),
        this.itemService.queryAll()
      )
      .subscribe(
        result => {
          this.user = result && result[0];
          this.currentItems = result && result[1];
          this.currentItems.map(item => {
            if(item && item.created_by) {
              this.userService
                .getUser(item.created_by)
                .subscribe(user => {
                  item['user'] = user;
                });
            }
          });
        }
      )

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
    Observable
      .forkJoin(
        this.userService.getMe(),
        this.itemService.queryAll()
      )
      .subscribe(
        result => {
          this.user = result && result[0];
          this.currentItems = result && result[1];
          this.currentItems.map(item => {
            if(item && item.created_by) {
              this.userService
                .getUser(item.created_by)
                .subscribe(user => {
                  item['user'] = user;
                });
            }
          });
          console.log('this', this);
        }
      )
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
    console.log('item', item);
    if(item && item.id && item.comments && item.comments.length > 0) {
          let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: item.comments, user: this.user || null});
          addModal.onDidDismiss(item => {
            this.refetch();
          })
          addModal.present();
    }
  }

  addNotes(item: any) {
    if(item && item.notes && item.notes.find(note => this.user && this.user.id && note && note.created_by  && note.created_by == this.user.id)) {
      let userNote = item.notes.find(n => n.created_by == this.user.id);
      if(userNote && userNote.id) {
        this.notesService
            .deleteNote(item.id, userNote.id)
            .subscribe(no => {
              console.log('no', no);
              this.refetch();
            });
      }
    } else {
      if(this.user && this.user.id && item && item.id) {
        this.notesService
          .createNote({description: '1', created_by: this.user.id}, item.id)
          .subscribe(no => {
            console.log('no', no);
            this.refetch();
          });
      }
    }
  }

  isColored(item: any) {
    if(item && item.notes && item.notes.find(note => this.user && this.user.id && note && note.created_by  && note.created_by == this.user.id)) {
      return 'primary';
    } else {
      return 'dark';
    }
  }

  openU() {
    console.log('u');
  }

  openUser(user: any, userId: any) {
    if(user && userId) {
      let addModal = this.modalCtrl.create('UserCardPage', {user: user, userId: userId});
      addModal.onDidDismiss(res => {
        // this.refetch();
      })
      addModal.present();
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
