import { ViewChild, Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams, ViewController, Slides } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
declare const google: any;
import { Items, User, Comments, Notes } from '../../providers';

import { LatLngLiteral, MapsAPILoader } from '@agm/core';
export const Tab1Root = 'ListMasterPage';
// import { each, chunk, has } from 'lodash';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  @ViewChild(Slides) slides: Slides;

  item: any;
  user: any;
  title: string = 'My first AGM project';
  lat: number = 48.849145;
  lng: number = 2.389659;
  zoom: number = 17;
  paths: LatLngLiteral[];

  selectedShape: any;
  @Input() withOutsideActionButtons = true;
  @Input() withInsideActionButtons = false;
  @Input() polylines: any;
  poly: any;
  showSaveButton: boolean = false;
  showDeleteButton: boolean = false;
  // map: any;

  commentForm: FormGroup;

  private map: Promise<any>;
  private mapBounds: any;
  private commonPolylineConfig: any = {};
  @Input() readonly = false;
  @Input() emitOnOverlayComplete = false;
  @Input() polylineDraggable = false;
  @Input() polylineEditable = false;
  isReadyToSave: boolean;
  
  private currentPolylines: any[] = [];
  private currentPolyline: any;

  @Output() onPolylineDrawn = new EventEmitter();

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    navParams: NavParams,
    public viewCtrl: ViewController,
    public items: Items,
    public toastCtrl: ToastController,
    private mapLoader: MapsAPILoader,
    private cd: ChangeDetectorRef,
    public commentsService: Comments,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public userService: User,
    public notesService: Notes,
  ) {
    this.item = navParams.get('item') || {};
    this.user = navParams.get('user') || null;
    if(this.user && this.user.admin) {
      this.showDeleteButton = true;
      this.showSaveButton = true;
    }
    if(this.item && this.item.created_by && this.user && this.user.id) {
      if(parseInt(this.user.id) == parseInt(this.item.created_by)) {
        this.showDeleteButton = true;
      }
    }

    this.commentForm = formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || '']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });
  }

  ionViewWillEnter() {
    this.initiateComponent();

    this.commentForm = this.formBuilder.group({
      description: [''],
      created_by: [this.user && this.user.id || '']
    });
  
    // Watch the form for changes, and
    this.commentForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.commentForm.valid;
    });

    setTimeout(() => {
        this.slides.lockSwipes(true);
    }, 500);
  }

  // ionViewDidEnter() {
  //   this.initiateComponent();
  // }
  refetch() {
    if(this.item && this.item.id) {
      Observable
        .forkJoin(
          this.userService.getMe(),
          this.items.getStroll(this.item.id)
        )
        .subscribe(
          result => {
            this.user = result && result[0];
            this.item = result && result[1];
            if(this.item && this.item.created_by) {
              this.userService
                .getUser(this.item.created_by)
                .subscribe(user => {
                  this.item['user'] = user;
                });
            }
          }
        )
    }
  }

  publish(item: any) {
    this.commentForm.get('created_by').setValue(this.user && this.user.id && this.user.id.toString() || null);
    if(!this.commentForm.valid) { return; }
    if(item && item.id && this.commentForm.get('description').value && this.commentForm.get('created_by').value) {
      this.commentsService
        .createComment(this.commentForm.value, item.id)
        .subscribe(com => {
          this.commentForm.get('description').setValue(null);
          this.refetch();
          // console.log('com', com);this.comm
        });
    } else {
      const toast = this.toastCtrl.create({
        message: 'Votre commentaire est vide !',
        duration: 3000
      });
      toast.present();
    }
  }


  addNotes(item: any) {
    if(item && item.notes && item.notes.find(note => this.user && this.user.id && note && note.created_by  && note.created_by == this.user.id)) {
      let userNote = item.notes.find(n => n.created_by == this.user.id);
      if(userNote && userNote.id) {
        this.notesService
            .deleteNote(item.id, userNote.id)
            .subscribe(no => {
              console.log('no', no);
              this.refetch();
            });
      }
    } else {
      if(this.user && this.user.id && item && item.id) {
        this.notesService
          .createNote({description: '1', created_by: this.user.id}, item.id)
          .subscribe(no => {
            console.log('no', no);
            this.refetch();
          });
      }
    }
  }

  isColored(item: any) {
    if(item && item.notes && item.notes.find(note => this.user && this.user.id && note && note.created_by  && note.created_by == this.user.id)) {
      return 'primary';
    } else {
      return 'dark';
    }
  }

  checkComments(item: any) {
    console.log('item', item);
    if(item && item.id && item.comments && item.comments.length > 0) {
          let addModal = this.modalCtrl.create('ItemCommentsPage', {item: item, comments: item.comments, user: this.user || null});
          addModal.onDidDismiss(item => {
            this.refetch();
          })
          addModal.present();
    }
  }

  initiateComponent() {
    if(this.isAdmin()) {
      this.polylineEditable = true;
      this.polylineDraggable = true;
      this.showDeleteButton = true;
    }
    // console.log('item', this.item);
    if(this.item.id && this.item.paths && this.item.paths.length && this.item.paths.length > 0) {
      
      let formatedPath = [];

      this.item.paths.map(p => {
        p['lat'] = p && p.latitude || null;
        p['lng'] = p && p.longitude || null;
        formatedPath.push(p);
        this.polylines = formatedPath;
        this.lat = formatedPath[0] && formatedPath[0].latitude || null;
        this.lng = formatedPath[0] && formatedPath[0].longitude || null;
      });

      this.initiateMap();
    }
  }

  initiateMap() {
    this.setCommonPolylineConfig();
    this.map = this.initMap();
    this.setPolylineMap();
  }

  setPolylineMap() {
    var symbolThree = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      strokeColor: 'red',
      strokeWeight: 1,
      scale: 3,
      fillColor: 'red',
      fillOpacity: 1
    };

    this.poly = new google.maps.Polyline({
      path: this.polylines || {},
      strokeColor: 'red',
      strokeOpacity: 1,
      strokeWeight: 5,
      editable: this.polylineEditable,
      draggable: this.polylineDraggable,
      geodesic: true,
      icons: [
       {
          icon: symbolThree,
          offset: '50%',
          repeat: '100px'
        }
      ],
    });
    
    this.map.then(map => {
      this.poly.setMap(map);
      // WE NEED TO SET MARKER BY DEFAULT
      // map.addListener('overlaycomplete', event => {
      //   var marker = new google.maps.Marker({
      //     position: event.latLng,
      //     title: '#' + path.getLength(),
      //     map: map
      //   });
      // });

      let input = document.getElementById('pac-input');
      let searchBox = new google.maps.places.SearchBox(input);
      // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
      });
      
      searchBox.addListener('places_changed', () => {
        let places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        let bounds = new google.maps.LatLngBounds();
        places.forEach((place, index) => {
          if (!place.geometry) {
            return;
          }

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });

        map.fitBounds(bounds);
      });

      if(this.isAdmin()) {
        map.addListener('click', event => {
          this.showSaveButton = true;
          console.log('clicked', this.showSaveButton);
          this.addLatLng(event);
        });

        map.addListener('dragend', event => {
            console.log('draggued');
        });
      } else {
        map.addListener('onLoad', event => {
          this.addLatLng(event);
        });
      }
    });
  }

  editStroll() {
    console.log('edited');
    let addModal = this.modalCtrl.create('ItemCreatePage', {item: this.item});
      addModal.onDidDismiss(item => {
        console.log('item', item);
        if (item) {
          console.log('enter');
          this.items
              .updateStroll(item, this.item.id)
              .subscribe(res => {
                // if (res) this.items.push(res);
                console.log('res', res);
                // this.viewCtrl.dismiss(res);
              });
          // this.items.add(item);
        }
      })
      addModal.present();
  }

  initMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mapLoader.load().then(() => {
        const map = new google.maps.Map(document.getElementById('map'), {
          center: new google.maps.LatLng(this.lat, this.lng),
          zoom: this.zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scrollwheel: false
        });

        if (this.readonly === false) {
          
          // const drawingManager = new google.maps.drawing.DrawingManager({
          //   drawingMode: null,
          //   drawingControl: true,
          //   drawingControlOptions: {
          //     position: google.maps.ControlPosition.BOTTOM_CENTER,
          //     drawingModes: ['polyline']
          //   },
          //   polylineOptions: this.commonPolylineConfig
          // });
          // drawingManager.setMap(map);

          // google.maps.event.addListener(
          //   drawingManager,
          //   'overlaycomplete',
          //   event => {
          //     const polyline = event.overlay;
          //     if (event.type == 'polyline') {
          //       if (drawingManager) {
          //         drawingManager.setDrawingMode(null);
          //       }
          //       this.attachClickEventOnPolyline(polyline);

          //       this.attachInsertAtEventOnPolyline(polyline);

          //       this.attachSetAtEventOnPolyline(polyline);

          //       this.addPolylineToCollection({polyline: polyline});
          //       this.selectShape(polyline, event);
          //       if (this.emitOnOverlayComplete) {
          //         this.fromMapPathsToDB();
          //       }
          //     }
          //   }
          // );
        }
        resolve(map);
      });
    });
  }

  setCommonPolylineConfig() {
    this.commonPolylineConfig = {
      strokeColor: 'red',
      strokeOpacity: 1,
      strokeWeight: 5,
      editable: this.polylineEditable,
      draggable: this.polylineDraggable,
      geodesic: true,
    }
  }

  addLatLng(event) {
    this.currentPolyline = Object.assign({}, { poly: this.poly.getPath(), event: event.latLng });
    this.currentPolylines = [];    var path = this.poly.getPath();
    var path = this.poly.getPath();
    path.push(event.latLng);
    this.paths = path;
    // console.log('this.poly', this.poly.getPath().getArray());
  }

  savePath() {
    let polylines = [];
    let oldPolylines = [];

    if(this.currentPolyline && this.currentPolyline.poly && this.currentPolyline.poly.getArray() && this.currentPolyline.poly.getArray().length && this.currentPolyline.poly.getArray().length > 0) {
      this.currentPolyline.poly.forEach((path: any, index) => {
        polylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      });

      // this.paths.forEach((path: any, index) => {
      //   oldPolylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      // });

      console.log('1');

      console.log('oldPath', polylines, this);

      this.polylines.map((p, index) => {
        if(p && p.id) {
          console.log('1.5');
          this.items
            .deletePath(this.item.id, p.id)
            .subscribe(re => {
              console.log('1.7');
              if(index == this.polylines.length-1) {
                console.log('2', index, this.polylines.length-1);
                this.saveNewPath(polylines);
              }
            });
        }
      });
    }
  }

  saveNewPath(polylines: any) {
    console.log('3');
      if(polylines && polylines.length > 0) {
        polylines.map(po => {
          this.items
            .createPath(po, this.item.id)
            .subscribe(
              p => {
                console.log('path added');
              }
            );
        });
      }
  }

  deleteStroll() {
    const confirm = this.alertCtrl.create({
      title: 'Supprimer le parcours?',
      message: 'Attention, vous allez supprimer votre balade !',
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
            this.polylines = null;
            this.paths = null;
            this.poly.setMap(null);
            this.initiateMap();

            this.items
              .deleteStroll(this.item.id)
              .subscribe(a => {
                const toast = this.toastCtrl.create({
                  position: 'top',
                  message: 'La balade a été supprimer.',
                  duration: 3000
                });

                toast.present();

                this.viewCtrl.dismiss();
                this.navCtrl.push(Tab1Root);
              });
        
          }
        }
      ]
    });

    confirm.present();
  }
  
  isAdmin() {
    if(this.user && this.user.admin) {
      return true;
    }
    if(this.item && this.item.created_by && this.user && this.user.id) {
      if(parseInt(this.user.id) == parseInt(this.item.created_by)) {
        return true;
      }
    }
    return false;
  }

  undo() {
    if(this.currentPolyline && this.currentPolyline.poly && this.currentPolyline.event && this.currentPolyline.poly.getArray() && this.currentPolyline.poly.getArray().length && this.currentPolyline.poly.getArray().length > 0) {
      let polyArray = this.currentPolyline.poly.getArray();
      this.currentPolylines.push(polyArray[polyArray.length-1]);
      this.currentPolyline.poly.removeAt(this.currentPolyline.poly.length-1);
    }
  }

  redo() {
    if(this.currentPolyline && this.currentPolyline.poly && this.currentPolyline.event) {
      if(this.currentPolylines.length > 0 ) {
        this.currentPolyline.poly.push(this.currentPolylines[this.currentPolylines.length-1]);
        this.currentPolylines.pop();
      }
    }
  }

  next() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  prev() {
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
  }
}
