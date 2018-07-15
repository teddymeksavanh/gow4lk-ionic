import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Comments } from '../../providers/comments/comments';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-item-comments',
  templateUrl: 'item-comments.html'
})
export class ItemCommentsPage {
  isReadyToSave: boolean;
  comments: any;
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
    this.comments = navParams.get('comments') || [];
    this.item = navParams.get('item') || undefined;

    this.commentForm = formBuilder.group({
      description: ['']
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
      description: ['']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  modifyComments(comment: any) {
    console.log('comment', comment);
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
}
