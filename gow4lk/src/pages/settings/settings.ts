import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { User } from '../../providers/user/user';

import { Settings, Api } from '../../providers';
import { MyApp } from '../../app/app.component';
import { FirstRunPage } from '../.';
/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  @ViewChild('fileInput') fileInput;
  // Our local settings object
  isReadyToSave: boolean;
  options: any;

  settingsReady = false;

  formProfile: FormGroup;
  formAvatar: FormGroup;

  file: any;
  user: any;

  profileSettings = {
    page: 'profile',
    pageTitleKey: 'SETTINGS_PAGE_PROFILE'
  };

  adminSettings = {
    page: 'admin',
    pageTitleKey: 'Admin'
  };

  page: string = 'main';
  pageTitleKey: string = 'SETTINGS_TITLE';
  pageTitle: string;

  // adminPage: any = AdminPage;
  subSettings: any = SettingsPage;

  constructor(public navCtrl: NavController,
    private app: MyApp,
    public settings: Settings,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public camera: Camera,
    public translate: TranslateService,
    public userService: User,
    public apiService: Api,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {
  }

  ionViewDidLoad() {
    // Build an empty form for the template to render
    this.fetchUser();
    // this.fetchAvatar();
  }

  fetchAvatar() {
    // this.userService.getMeAvatar()
    //   .subscribe(picture => {
    //     console.log('picture', picture);
    //   });
  }

  openAdmin() {
    if(this.user && this.user.admin) {
      let addModal = this.modalCtrl.create('AdminPage', {user: this.user});
      addModal.onDidDismiss(res => {
        // this.refetch();
      })
      addModal.present();
    }
  }

  openTypes() {
    if(this.user && this.user.admin) {
      let addModal = this.modalCtrl.create('ItemTypesPage', {user: this.user});
      addModal.onDidDismiss(res => {
        // this.refetch();
      })
      addModal.present();
    }
  }

  deleteAccount() {
    const prompt = this.alertCtrl.create({
      title: 'Supprimer son compte',
      message: "Êtes-vous sûr ? Cette action sera irréversible.",
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmer',
          handler: data => {
            if(this.user && this.user.id) {
              this.userService
                  .deleteMe(this.user.id)
                  .subscribe(u => {
                    this.userService.logout();
                    this.app.getRootNav().setRoot(FirstRunPage);
                  });
            }
          }
        }
      ]
    });
    prompt.present();
  }

  fetchUser() {
    this.userService.getMe()
      .subscribe(user => {
        this.user = user;
        
        this.formAvatar = this.buildAvatarForm();
        this.formAvatar.valueChanges.subscribe((v) => {
          this.isReadyToSave = this.formAvatar.valid;
        });
        
        this.formProfile = this.buildProfileForm();
        this.formProfile.valueChanges.subscribe((v) => {
          this.isReadyToSave = this.formProfile.valid;
        });
        
        this.isReadyToSave = this.formProfile.valid;
      });
  }

  updateProfile() {
    if (this.formProfile.valid) {
      this.formProfile.get('picture').setValue(this.formAvatar.get('picture').value);
      console.log('this.formProfile', this.formProfile.value);
      this.userService
        .update(this.formProfile.value)
        .subscribe(updatedUser => {
          this.page = 'main';
        });

      this.navCtrl.pop();

      console.log('this.', this.formAvatar.value);

      if (this.formAvatar.valid && this.file) {
        // this.userService
        //     .updateAvatar(this.file)
        //     .subscribe(updatedAvatar => {
        //       console.log('updatedAvatar');
        //       console.log('this', updatedAvatar);
        //     });
      }
    }
  }

  buildAvatarForm() {
    return this.formBuilder.group({
      picture: [this.user && this.user.picture && this.user.picture.url && (this.apiService.url + this.user.picture.url) || ''],
    });
  }

  buildProfileForm() {
    return this.formBuilder.group({
      picture: [this.user && this.user.picture && this.user.picture.url && (this.apiService.url + this.user.picture.url) || ''],
      name: [this.user && this.user.name || null, Validators.required],
      email: [this.user && this.user.email || null, Validators.required],
      // password: [null]
    });
  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 96,
        targetHeight: 96
      }).then((data) => {
        this.formAvatar.patchValue({ 'picture': 'data:image/jpg;base64,' + data });
      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processWebImage(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    this.file = file;
    reader.onload = (readerEvent) => {
      let imageData = (readerEvent.target as any).result;
      this.formAvatar.patchValue({ 'picture': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  getProfileImageStyle() {
    return 'url(' + this.formAvatar.controls['picture'].value + ')'
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render

    this.page = this.navParams.get('page') || this.page;
    this.pageTitleKey = this.navParams.get('pageTitleKey') || this.pageTitleKey;

    this.translate.get(this.pageTitleKey).subscribe((res) => {
      this.pageTitle = res;
    })

    this.settings.load().then(() => {
      this.settingsReady = true;
      this.options = this.settings.allSettings;
    });
  }

  disconnect() {
    const prompt = this.alertCtrl.create({
      title: 'Se déconnecter',
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmer',
          handler: data => {
            this.userService.logout();
            this.app.getRootNav().setRoot(FirstRunPage);
          }
        }
      ]
    });
    prompt.present();
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

  ngOnChanges() {
    console.log('Ng All Changes');
  }
}
