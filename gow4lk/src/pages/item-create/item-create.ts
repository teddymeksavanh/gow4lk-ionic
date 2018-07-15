import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Api } from '../../providers/api/api';
import { NavParams, IonicPage, NavController, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html'
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: any;

  form: FormGroup;

  constructor(
      public navCtrl: NavController,
      public viewCtrl: ViewController,
      public formBuilder: FormBuilder,
      navParams: NavParams,
      public camera: Camera,
      public apiService: Api,
      public itemService: Items
  ) {
    this.item = navParams.get('item') || {};
  }

  ionViewDidEnter() {
    this.form = this.formBuilder.group({
      gallery: [this.item && this.item.gallery && this.item.gallery.url && (this.apiService.url + this.item.gallery.url) || ''],
      name: [this.item && this.item.name || '', Validators.required],
      description: [this.item && this.item.description || ''],
      city: [this.item && this.item.city || ''],
      country: [this.item && this.item.country || ''],
      length: [22],
      latitude: [22],
      longitude: [22]
    });
  
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 96,
        targetHeight: 96
      }).then((data) => {
        this.form.patchValue({ 'gallery': 'data:image/jpg;base64,' + data });
      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {

      let imageData = (readerEvent.target as any).result;
      this.form.patchValue({ 'gallery': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['gallery'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { return; }
    console.log('this.form.value', this.form.value);  
    this.viewCtrl.dismiss(this.form.value);
  }
}
