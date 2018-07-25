import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Items } from '../../providers/items/items';
import { Api } from '../../providers/api/api';
declare const google: any;
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
  types: any;
  type: any;
  polylines: any;
  selectedType: any;

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
    this.polylines = navParams.get('polylines') || [];

    this.itemService
      .getTypes()
      .subscribe(types => {
        this.types = types;
      });

    this.form = formBuilder.group({
      gallery: [this.item && this.item.gallery && this.item.gallery.url && (this.apiService.url + this.item.gallery.url) || this.item && this.item.gallery_seed || ''],
      name: [this.item && this.item.name || '', Validators.required],
      description: [this.item && this.item.description || ''],
      city: [this.item && this.item.city || ''],
      country: [this.item && this.item.country || ''],
      length: [22],
      latitude: [22],
      longitude: [22]
    });

    // this.selectedType = this.item && this.item.types && this.item.types[0] && this.item.types[0].id || '';
  
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });

    if(this.polylines && this.polylines.length && this.polylines.length > 0 && this.polylines[0] && this.polylines[0].latitude && this.polylines[0].longitude) {

      let geocoder = new google.maps.Geocoder;
      // var infowindow = new google.maps.InfoWindow;

      geocoder.geocode( {'location': {lat: this.polylines[0].latitude, lng: this.polylines[0].longitude}}, (rs, st) => {
        if(st === 'OK') {
          if(rs && rs.length > 0 && rs[0] && rs[0].formatted_address) {
            this.form.get('city').setValue(rs[0].formatted_address);
          }
        }
      });

      if(this.polylines.length > 2) {
        let distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(this.polylines[0].latitude, this.polylines[0].longitude),
          new google.maps.LatLng(this.polylines[this.polylines.length-1].latitude, this.polylines[this.polylines.length-1].longitude)
        );
  
        if(distance) {
          this.form.get('length').setValue(distance);
        }
      }
    }
  }

  ionViewDidEnter() {
    this.form = this.formBuilder.group({
      gallery: [this.item && this.item.gallery && this.item.gallery.url && (this.apiService.url + this.item.gallery.url) || this.item && this.item.gallery_seed || ''],
      name: [this.item && this.item.name || '', Validators.required],
      description: [this.item && this.item.description || ''],
      city: [this.item && this.item.city || ''],
      country: [this.item && this.item.country || ''],
      length: [''],
      latitude: [22],
      longitude: [22]
    });

    // this.selectedType = this.item && this.item.types && this.item.types[0] && this.item.types[0].id || '';
  
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });

    if(this.polylines && this.polylines.length && this.polylines.length > 0 && this.polylines[0] && this.polylines[0].latitude && this.polylines[0].longitude) {

      var geocoder = new google.maps.Geocoder;
      // var infowindow = new google.maps.InfoWindow;

      geocoder.geocode( {'location': {lat: this.polylines[0].latitude, lng: this.polylines[0].longitude}}, (rs, st) => {
        if(st === 'OK') {
          if(rs && rs.length > 0 && rs[0] && rs[0].formatted_address) {
            this.form.get('city').setValue(rs[0].formatted_address);
          }
        }
      });

      if(this.polylines.length > 2) {
        let distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(this.polylines[0].latitude, this.polylines[0].longitude),
          new google.maps.LatLng(this.polylines[this.polylines.length-1].latitude, this.polylines[this.polylines.length-1].longitude)
        );
  
        if(distance) {
          // distance = parseFloat(distance);
          // distance = distance.toFixed(3);
          this.form.get('length').setValue(distance);
        }
      }
    }
  }

  isSelected(id: number) {
    if(this.item && this.item.strolltypes && this.item.strolltypes.length > 0) {
      if(this.item.strolltypes.find(t => t && t.type && t.type.id && id && t.type.id == id)) {
        return true;
      }
      return false;
    }
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
    this.viewCtrl.dismiss(this.form.value, this.type);
  }
}
