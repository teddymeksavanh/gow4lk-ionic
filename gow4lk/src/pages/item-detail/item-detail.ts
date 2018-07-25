import { ViewChild, Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams, ViewController, Slides } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
declare const google: any;
import { Items, User, Comments, Notes, Api } from '../../providers';

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
  baseApiUrl: string;

  pathDetailsForm: FormGroup;

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
  mapBounds: any;
  commonPolylineConfig: any = {};
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
    // private cd: ChangeDetectorRef,
    public commentsService: Comments,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public userService: User,
    public notesService: Notes,
    public apiService: Api
  ) {
    this.baseApiUrl = this.apiService.url + '/';
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

    this.pathDetailsForm = formBuilder.group({
      name: [''],
      photo: ['']
    });
  
    // Watch the form for changes, and
    this.pathDetailsForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.pathDetailsForm.valid;
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

    this.pathDetailsForm = this.formBuilder.group({
      name: [''],
      photo: ['']
    });
  
    // Watch the form for changes, and
    this.pathDetailsForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.pathDetailsForm.valid;
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
            console.log('result', result);
            this.user = result && result[0];
            this.item = result && result[1];
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

  initiateComponent2(item: any) {
    if(this.isAdmin()) {
      this.polylineEditable = true;
      this.polylineDraggable = true;
      this.showDeleteButton = true;
    }
    if(item.id && item.paths && item.paths.length && item.paths.length > 0) {
      
      let formatedPath = [];

      item.paths.map(p => {
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
      editable: false,
      draggable: false,
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

      // SET PATHS STYLE

      this.polylines.map(pol => {
        if(pol && pol.latitude && pol.longitude) {

          // CREATE DIV INSIDE INFO BULLES
          let content = document.createElement('div');
          // content.style = 'width: 250px; text-align: left;';
          let closeBtn;
          let inputDescription;
          let submitBtn;
          let pictureShow;
          let pictureBtn;
          let inputDescriptionTitle;

          if(this.isAdmin()) {
            pictureShow = content.appendChild(document.createElement('img'));
            pictureShow.src = pol && pol.photo && pol.photo.url && this.baseApiUrl + pol.photo.url || pol.photo_seed || '/assets/img/placeholder.png';
            pictureShow.style = "height: 150px; margin-top: 20px;";

            inputDescriptionTitle = content.appendChild(document.createElement('span'));
            inputDescriptionTitle.innerHTML = 'Annecdotes';
            inputDescriptionTitle.style = 'display: block; text-align: left; margin: 10px auto 0 auto; padding: 5px 15px 0 0; font-weight: 600; opacity: 0.8;';

            inputDescription = content.appendChild(document.createElement('input'));
            inputDescription.type = 'text';
            inputDescription.value = pol && pol.name || "Je n'ai pas écrit d'anecdotes pour le moment";
            inputDescription.placeholder = 'Description';
            inputDescription.style = 'display: block; margin: 10px auto; padding: 5px 15px; width: 100%;';
  
            pictureBtn = content.appendChild(document.createElement('input'));
            pictureBtn.type = 'file';
            pictureBtn.placeholder = 'Prendre une photo';
            pictureBtn.style = 'display: block; margin: 10px auto; padding: 5px 15px;';
  
            submitBtn = content.appendChild(document.createElement('input'));
            submitBtn.type = 'button';
            submitBtn.value = 'Sauvegarder';
            submitBtn.style = 'margin: 10px auto; padding: 5px 10px; background-color: #488aff; color: white; border: none; border-radius: 2px; float: right;';

            closeBtn = content.appendChild(document.createElement('input'));
            closeBtn.type = 'button';
            closeBtn.value = 'Fermer';
            closeBtn.style = 'margin: 10px auto; padding: 5px 10px; background-color: #f53d3d; color: white; border: none; border-radius: 2px; float: left;';

            // SAUVEGARDER LES INFOS
            google.maps.event.addDomListener(pictureBtn, 'change', $event => {
              this.processWebImage($event);
            });
            
            // SUBMIT
            google.maps.event.addDomListener(submitBtn, 'click', () => {
              this.savePathDetails({path: pol, name: inputDescription.value, picture: pictureBtn.value});
              infowindow.close();
            });
          } else {
            pictureShow = content.appendChild(document.createElement('img'));
            pictureShow.src = pol && pol.photo && pol.photo.url && this.baseApiUrl + pol.photo.url || '/assets/img/placeholder.png';
            pictureShow.style = "height: 150px; margin-top: 20px;";
            
            inputDescriptionTitle = content.appendChild(document.createElement('span'));
            inputDescriptionTitle.innerHTML = 'Annecdotes';
            inputDescriptionTitle.style = 'display: block; text-align: left; margin: 10px auto 0 auto; padding: 5px 15px 0 0; font-weight: 600; opacity: 0.8;';

            inputDescription = content.appendChild(document.createElement('span'));
            inputDescription.innerHTML = pol && pol.name || "Je n'ai pas écrit d'anecdotes pour le moment";
            inputDescription.style = 'display: block; text-align: left; margin: 10px auto 10px auto; padding: 0 5px 15px 0;';

            closeBtn = content.appendChild(document.createElement('input'));
            closeBtn.type = 'button';
            closeBtn.value = 'Fermer';
            closeBtn.style = 'margin: 10px auto; padding: 5px 10px; background-color: #f53d3d; color: white; border: none; border-radius: 2px;';
          }

          // SET INFO BULLES
          var infowindow = new google.maps.InfoWindow();
          infowindow.setContent(content);

          // CLOSE INFO BULLES
          google.maps.event.addDomListener(closeBtn,'click', () => {
            infowindow.close();
          });

          // SET MARKERS
          let marker = new google.maps.Marker({
            position: {lat: pol.latitude, lng: pol.longitude},
            title: 'ok',
            map: map
          });

          marker.setMap(map);

          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
        }
      });
      // FIN PATH STYLES

      this.poly.setMap(map);

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
          // let marker = new google.maps.Marker({
          //   position: event.latLng,
          //   title: 'ok',
          //   map: map
          // });
          this.showSaveButton = true;
          this.addLatLng(event);
        });

        // map.addListener('dragend', event => {
        //     console.log('draggued');
        // });
      } else {
        map.addListener('onLoad', event => {
          this.addLatLng(event);
        });
      }
    });
  }

  savePathDetails(pathDetails: any) {
    if(pathDetails && pathDetails.name) this.pathDetailsForm.get('name').setValue(pathDetails.name);
    if(pathDetails && pathDetails.path && this.pathDetailsForm.value) this.updatePathDetails(pathDetails.path, this.pathDetailsForm.value);
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {
      let imageData = (readerEvent.target as any).result;
      this.pathDetailsForm.patchValue({ 'photo': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  updatePathDetails(pathDetails: any, pathDetailsData: any) {
    if(this.item && this.item.id && pathDetails && pathDetails.id) {
      Observable
        .forkJoin(
          this.items.updatePath(this.item.id, pathDetails.id, pathDetailsData),
          this.items.getStroll(this.item.id)
        )
        .subscribe(result => {
          this.item = result && result[1];
          if(this.item) {
            this.viewCtrl.dismiss();
            // this.navCtrl.push(ItemDetailPage, {item: this.item, user: this.user});
          }
        });
    }
  }

  editStroll() {
    let addModal = this.modalCtrl.create('ItemCreatePage', {item: this.item, polylines: this.polylines});
      addModal.onDidDismiss((item: any, types: any) => {
        let newItem;

        if(item) {
          newItem = {
            name: item && item.name,
            description: item && item.description,
            gallery: item && item.gallery
          };
        }

        if(item && types) {
          let newTypes;
          let deletedTypes;

          newTypes = types.filter(t => {
            if(this.item.strolltypes.find(st => st && st.type && st.type.id && t && t.id && st.type.id == t.id)) {
              return false;
            } else {
              return true;
            }
          });

          deletedTypes = this.item.strolltypes.filter(st => {
            if(types.find(t => t && t.id && st && st.type && st.type.id && t.id == st.type.id)) {
              return false;
            } else {
              return true;
            }
          });

          if(deletedTypes && deletedTypes.length > 0) {
            deletedTypes.map(typo => {
              if(typo && typo.id) {
                this.items
                    .deleteStrollType(this.item.id, typo.id)
                    .subscribe(ty => {
                      console.log('deleted');
                    });
              }
            });
          }

          if(newTypes && newTypes.length > 0) {
            newTypes.map(typo => {
              this.items
                .createStrollType(this.item.id, typo)
                .subscribe(ty => {
                  console.log('pushed');
                });
            });
          }
        }

        if (newItem && this.item && this.item.id) {
          // if(types && types.name && this.item && this.item.types && this.item.types[0] && this.item.types[0].id) {       
          //     this.items
          //       .deleteType(this.item && this.item.types && this.item.types[0] && this.item.types[0].id)
          //       .subscribe(azaz => {
          //         this.items
          //           .addStrollType(this.item.id, types)
          //           .subscribe(ty => {
          //             this.refetch();
          //           });
          //       });
          // } else {

          // }

          this.items
            .updateStroll(newItem, this.item.id)
            .subscribe(res => {
              this.refetch();
            });
        }
      })
      addModal.present();
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

  updateStroll(item, itemId: number) {
    let geocoder = new google.maps.Geocoder;
    // let infowindow = new google.maps.InfoWindow;
    let stroll = {city: '', length: ''};

    geocoder.geocode( {'location': {lat: this.polylines[0].latitude, lng: this.polylines[0].longitude}}, (rs, st) => {
      if(st === 'OK') {
        if(rs && rs.length > 0 && rs[0] && rs[0].formatted_address) {
          stroll['city'] = rs[0].formatted_address;
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
        stroll['length'] = distance;
      }
    }

    this.items
        .updateStroll(stroll, itemId)
        .subscribe(res => {
          if (res) this.item = res;
          // this.viewCtrl.dismiss(res);
        });
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
      editable: false,
      draggable: false,
      geodesic: true,
    }
  }

  addLatLng(event) {
    this.currentPolyline = Object.assign({}, { poly: this.poly.getPath(), event: event.latLng });
    this.currentPolylines = [];
    var path = this.poly.getPath();
    path.push(event.latLng);
    this.paths = path;
    // console.log('this.poly', this.poly.getPath().getArray());
  }

  savePath() {
    let polylines = [];
    // let oldPolylines = [];

    if(this.currentPolyline && this.currentPolyline.poly && this.currentPolyline.poly.getArray() && this.currentPolyline.poly.getArray().length && this.currentPolyline.poly.getArray().length > 0) {
      this.currentPolyline.poly.forEach((path: any, index) => {
        polylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      });

      // this.paths.forEach((path: any, index) => {
      //   oldPolylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      // });

      this.polylines.map((p, index) => {
        if(p && p.id) {
          this.items
            .deletePath(this.item.id, p.id)
            .subscribe(re => {
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
        let toast = this.toastCtrl.create({
          message: 'Les chemins ont été mis à jours.',
          duration: 3000,
          position: 'top'
        });
      
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
      
        toast.present();
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
            // this.polylines = null;
            // this.paths = null;
            // this.poly.setMap(null);
            // this.initiateMap();

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
