import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { User } from '../../providers/user/user';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController, ToastController, AlertController } from 'ionic-angular';
// import { IfStmt } from '../../../node_modules/@angular/compiler';

@IonicPage()
@Component({
  selector: 'page-item-types',
  templateUrl: 'item-types.html'
})
export class ItemTypesPage {
  isReadyToSave: boolean;
  types: any;
  user: any;
  item: any;
  baseApiUrl;
  typeForm: FormGroup;

  form: FormGroup;

  constructor(
      public navCtrl: NavController,
      public viewCtrl: ViewController,
      public formBuilder: FormBuilder,
      navParams: NavParams,
      public camera: Camera,
      public apiService: Api,
      public itemService: Items,
      public userService: User,
      public alertCtrl: AlertController,
      public toastCtrl: ToastController,
  ) {
    this.baseApiUrl = this.apiService.url + '/';
    this.user = navParams.get('user') || undefined;

    this.itemService
        .getTypes()
        .subscribe(types => {
          this.types = types;
        });

    this.typeForm = formBuilder.group({
      name: ['']
    });
  
    // Watch the form for changes, and
    this.typeForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.typeForm.valid;
    });
  }

  ionViewWillEnter() {

    this.typeForm = this.formBuilder.group({
      name: ['']
    });
  
    // Watch the form for changes, and
    this.typeForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.typeForm.valid;
    });
  }

  refetch() {
    this.itemService
        .getTypes()
        .subscribe(types => {
          this.types = types;
        });
  }

  deleteTypes(type: any) {
    if(type && type.id) {
      const confirm = this.alertCtrl.create({
        title: 'Supprimer?',
        message: 'Attention, vous allez supprimer votre type !',
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
              this.itemService
                .deleteType(type.id)
                .subscribe(
                  erztery => {
                    this.types = this.types.filter(com => type.id !== com.id);
                    const toast = this.toastCtrl.create({
                      position: 'top',
                      message: "Le type a été supprimé.",
                      duration: 3000
                    });
    
                    toast.present();
                  }
                );             
            }
          }
        ]
      });
      confirm.present();
    }
  }

  publish() {
    if(!this.typeForm.valid) { return; }
    if(this.typeForm && this.typeForm.value && this.typeForm.value.name) {
      this.itemService
        .createType(this.typeForm.value)
        .subscribe(
          com => {
            this.typeForm.get('name').setValue(null);
            // com['user'] = this.user || null;
            const toast = this.toastCtrl.create({
              position: 'top',
              message: "Le type a été ajouté.",
              duration: 3000
            });
    
            toast.present();
            this.types.push(com);
          },
          error => {
            const toast = this.toastCtrl.create({
              position: 'top',
              message: 'Le nom existe déjà !',
              duration: 3000
            });

            toast.present();
          },
          () => {}
      );
    }
  }

  isAdmin() {
    // if(this.user && this.user['admin']) {
      // console.log('this', this);
      return true;
    // }
    // return false;
  }
}
