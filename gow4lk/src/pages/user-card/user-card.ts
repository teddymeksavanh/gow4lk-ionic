import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Comments } from '../../providers/comments/comments';
import { User } from '../../providers/user/user';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController } from 'ionic-angular';
// import { IfStmt } from '@angular/compiler';

@IonicPage()
@Component({
  selector: 'page-user-card',
  templateUrl: 'user-card.html'
})
export class UserCardPage {
  isReadyToSave: boolean;
  comments: any;
  userId: any;
  user: any;
  item: any;
  commentForm: FormGroup;

  accordions: any;

  form: FormGroup;

  width = 500;
  height = 400;
  type = 'doughnut2d';
  baseApiUrl;
  dataFormat = 'json';
  dataSource;
  smallComments: any[] = [];

  constructor(
      public navCtrl: NavController,
      public viewCtrl: ViewController,
      public formBuilder: FormBuilder,
      public navParams: NavParams,
      public camera: Camera,
      public apiService: Api,
      public commentsService:  Comments,
      public itemService: Items,
      public userService: User,
  ) {
    this.baseApiUrl = this.apiService.url + '/';
    this.user = this.navParams.get('user') || undefined;
    this.userId = this.navParams.get('userId') || undefined;

    if(this.userId) {
      this.userService
        .getUser(this.userId)
        .subscribe(user => {
          this.user = user;

          this.dataSource = {
            "chart": {
                "caption": "Mon exploration",
                "subCaption": `La contribution totale de ${this.user && this.user.name}`,
                "theme": "fint"
            },
            "data": [
                {
                    "label": "Balades",
                    "value": this.user && this.user.strolls && this.user.strolls.length
                },
                {
                    "label": "Commentaires",
                    "value": this.user && this.user.strolls && this.user.comments.length
                },
                {
                    "label": "Likes",
                    "value": this.user && this.user.strolls && this.user.notes.length
                }
            ]
          };

          if(this.user && this.user.comments && this.user.comments.length && this.user.comments.length > 3) {
            this.smallComments = this.user.comments.slice(this.user.comments.length-2);
          } else {
            this.smallComments = this.user.comments;
          }

          this.accordions = {
            "items": [
              {
                "name": "Balades",
                "open": false,
                "children": this.user && this.user.strolls
              },
              {
                "name": "Derniers commentaires",
                "open": false,
                "children": this.smallComments
              }
            ]
          };

        });
    }
  }

  ionViewWillEnter() {
    this.user = this.navParams.get('user') || undefined;
    this.userId = this.navParams.get('userId') || undefined;

    if(this.userId) this.fetchUser(this.userId);

    if(this.user) {

      if(this.user && this.user.comments && this.user.comments.length && this.user.comments.length > 3) {
        this.smallComments = this.user.comments.slice(this.user.comments.length-2);
      } else {
        this.smallComments = this.user.comments;
      }
      
      this.dataSource = {
        "chart": {
            "caption": "Mon exploration",
            "subCaption": `La contribution totale de ${this.user && this.user.name}`,
            "theme": "fint"
        },
        "data": [
            {
                "label": "Balades",
                "value": this.user && this.user.strolls && this.user.strolls.length
            },
            {
                "label": "Commentaires",
                "value": this.user && this.user.strolls && this.user.comments.length
            },
            {
                "label": "Likes",
                "value": this.user && this.user.strolls && this.user.notes.length
            }
        ]
      };

      this.accordions = {
        "items": [
          {
            "name": "Balades",
            "open": true,
            "children": this.user && this.user.strolls
          },
          {
            "name": "Derniers commentaires",
            "open": this.user && this.user.notes && this.user.notes.length > 3 ? false : true,
            "children": this.smallComments
          }
        ]
      };
    }
  }

  openItem(item: any) {
    if(item && item.id) {
      this.itemService
          .getStroll(item.id)
          .subscribe(stroll => {          
            this.navCtrl.push('ItemDetailPage', {
              item: stroll,
              user: this.user || null
            });
          });
    }
  }

  fetchUser(userId: number) {
    if(userId) {
      this.userService
        .getUser(userId)
        .subscribe(user => {
          this.user = user;

          if(this.user && this.user.comments && this.user.comments > 3) {
            console.log('sliced', this.user.comments.slice(this.user.comments.length-2));
            this.smallComments = this.user.comments.slice(this.user.comments.length-2);
          } else {
            console.log('ok 4');

            this.smallComments = this.user.comments;
          }    

          this.dataSource = {
            "chart": {
                "caption": "Mon exploration",
                "subCaption": `La contribution totale de ${this.user && this.user.name}`,
                "theme": "fint"
            },
            "data": [
                {
                    "label": "Balades",
                    "value": this.user && this.user.strolls && this.user.strolls.length
                },
                {
                    "label": "Commentaires",
                    "value": this.user && this.user.strolls && this.user.comments.length
                },
                {
                    "label": "Likes",
                    "value": this.user && this.user.strolls && this.user.notes.length
                }
            ]
          };

          this.accordions = {
            "items": [
              {
                "name": "Balades",
                "open": true,
                "children": this.user && this.user.strolls
              },
              {
                "name": "Derniers commentaires",
                "open": this.user && this.user.notes && this.user.notes.length > 3 ? false : true,
                "children": this.smallComments
              }
            ]
          };
        });
    }
  }

  toggleSection(i) {
    this.accordions.items[i]['open'] = !this.accordions.items[i]['open'];
  }
 
  toggleItem(i, j) {
    this.accordions.items[i].children[j]['open'] = !this.accordions.items[i].children[j]['open'];
  }

}
