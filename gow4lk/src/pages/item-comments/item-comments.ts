import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Comments } from '../../providers/comments/comments';
import { User } from '../../providers/user/user';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController, ToastController, AlertController } from 'ionic-angular';
// import { IfStmt } from '../../../node_modules/@angular/compiler';

@IonicPage()
@Component({
  selector: 'page-item-comments',
  templateUrl: 'item-comments.html'
})
export class ItemCommentsPage {
  isReadyToSave: boolean;
  comments: any;
  user: any;
  item: any;
  baseApiUrl;
  commentForm: FormGroup;

  form: FormGroup;

  constructor(
      public navCtrl: NavController,
      public viewCtrl: ViewController,
      public formBuilder: FormBuilder,
      navParams: NavParams,
      public camera: Camera,
      public apiService: Api,
      public commentsService:  Comments,
      public itemService: Items,
      public userService: User,
      public alertCtrl: AlertController,
      public toastCtrl: ToastController,
  ) {
    this.baseApiUrl = this.apiService.url + '/';
    this.comments = navParams.get('comments') || [];
    this.user = navParams.get('user') || undefined;
    this.item = navParams.get('item') || undefined;

    this.commentForm = formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || '']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  ionViewWillEnter() {

    this.commentForm = this.formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || '']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  deleteComments(comment: any) {
    if(comment && comment.id && this.item && this.item.id) {
      const confirm = this.alertCtrl.create({
        title: 'Supprimer?',
        message: 'Attention, vous allez supprimer votre commentaire !',
        buttons: [
          {
            text: 'Annuler',
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: 'Confirmer',
            handler: () => {
              this.commentsService
                .deleteComment(this.item.id, comment.id)
                .subscribe(erztery => {
                  this.comments = this.comments.filter(com => comment.id !== com.id);
                  const toast = this.toastCtrl.create({
                    position: 'top',
                    message: "Le commentaire a été supprimé.",
                    duration: 3000
                  });
  
                  toast.present();
                });             
            }
          }
        ]
      });
      confirm.present();
    }
  }

  publish(item: any) {
    if(!this.commentForm.valid) { return; }
    if(item && item.id && this.user && this.user.id) {
      this.commentForm.get('created_by').setValue(this.user.id);
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          this.commentForm.get('description').setValue(null);
          // com['user'] = this.user || null;
          const toast = this.toastCtrl.create({
            position: 'top',
            message: "Le commentaire a été ajouté.",
            duration: 3000
          });

          toast.present();
          this.comments.push(com);
        });
    }
  }

  isAdmin(comment: any) {
    if(this.user && this.user.id && comment && comment.created_by && this.user.id == comment.created_by || this.user.admin || this.item && this.item.created_by && this.user.id == this.item.created_by) {
      return true;
    }
    return false;
  }
}
