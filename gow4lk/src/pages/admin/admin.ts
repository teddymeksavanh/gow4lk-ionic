import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

// import { Item } from '../../models/item';
import { Items, User, Comments, Api } from '../../providers';
import { Observable } from '../../../node_modules/rxjs';
import { ToastController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {

  currentItems: any = [];
  result: any;
  baseApiUrl;
  currentUsers: any = [];
  usersResult: any;

  user: any;
  constructor(public apiService: Api, public cd: ChangeDetectorRef, public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, public items: Items, public userService: User, public commentsService: Comments, private alertCtrl: AlertController) {
    this.baseApiUrl = apiService.url + '/';

    this.userService
    .getMe()
    .subscribe((res: any) => {
      if (res) this.user = res;
    });

    Observable
      .forkJoin(
        this.items.queryAll(),
        this.userService.queryAllAdmin()
      )
      .subscribe(result => {
        this.result = result[0];
        this.result = this.result.concat(result[1]);
      });
  }

  ionViewWillEnter() {
    this.fetchDatas();
  }

  fetchDatas() {
    Observable
      .forkJoin(
        this.items.queryAll(),
        this.userService.queryAllAdmin()
      )
      .subscribe(result => {
        this.result = result[0];
        this.result = this.result.concat(result[1]);
        this.cd.markForCheck();
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

  desactivateItem(opener: any) {
    let datas = {};
    let openerKeys = Object.keys(opener);
    let isUser = openerKeys.find(k => k === 'admin');

    if(isUser) {
      datas['user'] = opener;
    } else {
      datas['item'] = opener;
      datas['user'] = this.user || null;
    }

    const confirm = this.alertCtrl.create({
      title: 'Désactiver?',
      message: `Attention, vous allez désactiver ${opener && opener.name} !`,
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
            
            if(isUser) {
              if(datas && datas['user'] && datas['user'].id && datas['user'].is_active) {
                this.userService
                  .reactivateUser(datas['user'].id)
                  .subscribe(user => {
                    let index = this.currentItems.findIndex(c => c && c.id && c.name && c.id == user.id && c.name == user.name);
                    if(index) {
                      this.currentItems[index] = user;
                    }
                    const toast = this.toastCtrl.create({
                      position: 'top',
                      message: "L'utilisateur a été désactivé.",
                      duration: 3000
                    });
    
                    toast.present();
                  });
              } else {
                this.userService
                    .deleteUser(datas['user'].id)
                    .subscribe(user => {
                      let index = this.currentItems.findIndex(c => c && c.id && c.name && c.id == user.id && c.name == user.name);
                      if(index) {
                        this.currentItems[index] = user;
                      }

                      const toast = this.toastCtrl.create({
                        position: 'top',
                        message: "L'utilisateur a été désactivé.",
                        duration: 3000
                      });
      
                      toast.present();
                    });
              }
            } else {
              if(datas && datas['item'] && datas['item'].id) {
                this.items
                  .deleteStroll(datas['item'].id)
                  .subscribe(a => {
                    let index = this.currentItems.findIndex(c => c.id && c.id == datas['item'].id);
                    if(index !== -1) {
                      let ke = Object.keys(datas['item']);
                      let isStroll = ke.indexOf('city') !== -1;
                      if(isStroll) {
                        this.currentItems = this.currentItems.filter(cI => cI && cI.id !== datas['item'].id);
                      }
                    }

                    const toast = this.toastCtrl.create({
                      position: 'top',
                      message: 'La balade a été supprimée.',
                      duration: 3000
                    });
    
                    toast.present();
                  });
              }
            }
          }
        }
      ]
    });

    confirm.present();
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
