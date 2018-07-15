import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Comments } from '../../providers/comments/comments';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController } from 'ionic-angular';
import { IfStmt } from '../../../node_modules/@angular/compiler';

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
      public itemService: Items
  ) {
    console.log('navParams', navParams);
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
      description: ['']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });

    this.getComments();
    console.log('this', this);
  }

  ionViewDidEnter() {
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
    console.log('comment', comment);
    if(comment && comment.id && this.item && this.item.id) {
      this.commentsService
        .deleteComment(this.item.id, comment.id)
        .subscribe(com => {
          this.comments = this.comments.filter(com => comment.id !== com.id);
        });
    }
  }

  publish(item: any) {
    console.log('publier');
    if(!this.commentForm.valid) { return; }
    console.log('this.commentForm', this.commentForm.value);
    if(item && item.id && this.user && this.user.id) {
      this.commentForm.get('created_by').setValue(this.user.id);
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          console.log('com', com);
          this.commentForm.get('description').setValue(null);
          this.comments.push(com);
        });
    }
    // this.commentsService.createComment()
  }

  getComments() {
    if(this.item && this.item.id) {
      this.commentsService
        .getComments(this.item.id)
        .subscribe(allCom => {
          if(allCom) {
            this.comments = allCom;
          }
        });
    }
  }

  isAdmin(comment: any) {
    if(this.user && this.user.id && comment && comment.created_by && this.user.id == comment.created_by) {
      return true;
    }
    return false;
  }
}
