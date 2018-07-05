import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../providers/user/user';

import { Settings } from '../../providers';

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

  user: any;

  profileSettings = {
    page: 'profile',
    pageTitleKey: 'SETTINGS_PAGE_PROFILE'
  };

  page: string = 'main';
  pageTitleKey: string = 'SETTINGS_TITLE';
  pageTitle: string;

  subSettings: any = SettingsPage;

  constructor(public navCtrl: NavController,
    public settings: Settings,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public camera: Camera,
    public translate: TranslateService,
    public userService: User
  ) {}

  ionViewDidLoad() {
    // Build an empty form for the template to render
    this.fetchUser();
  }

  fetchUser() {
    this.userService.getMe()
      .subscribe(user => {
        this.user = user;
        this.formProfile = this.buildProfileForm();
        this.isReadyToSave = this.formProfile.valid;
        this.formProfile.valueChanges.subscribe((v) => {
          this.isReadyToSave = this.formProfile.valid;
          console.log('this', this);
        });
      });
  }

  updateProfile() {
    console.log('this', this.formProfile.valid);
    if (this.formProfile.valid) {
      this.userService
        .update(this.formProfile.value)
        .subscribe(updatedUser => {
          console.log('updatedUser', updatedUser);
        });
    }
  }

  buildProfileForm() {
    return this.formBuilder.group({
      profilePic: [this.user && this.user.avatar || null],
      name: [this.user && this.user.name || null, Validators.required],
      email: [this.user && this.user.email || null, Validators.required],
      // password: [null]
    });
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

  ngOnChanges() {
    console.log('Ng All Changes');
  }
}
