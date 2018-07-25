import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicPage, NavController, ModalController, ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Items } from '../../providers';
import { ToastController } from 'ionic-angular';
declare const google: any;
import { LatLngLiteral, MapsAPILoader } from '@agm/core';
export const Tab1Root = 'ListMasterPage';
// import { each, chunk, has } from 'lodash';

@IonicPage()
@Component({
  selector: 'path-create',
  templateUrl: 'path-create.html'
})
export class PathCreatePage {
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
  showButtons: boolean = false;

  private currentPolylines: any[] = [];
  private currentPolyline: any;
  // map: any;
  private map: Promise<any>;
  mapBounds: any;
  commonPolylineConfig: any = {};
  @Input() readonly = false;
  @Input() emitOnOverlayComplete = false;
  @Input() polylineDraggable = true;
  @Input() polylineEditable = true;

  @Output() onPolylineDrawn = new EventEmitter();

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    // navParams: NavParams,
    public items: Items,
    public toastCtrl: ToastController,
    private mapLoader: MapsAPILoader,
    public modalCtrl: ModalController
  ) {
    // this.item = navParams.get('item') || {};
    // this.user = navParams.get('user') || null;
    // this.lat = 37.772;
    // this.lng = -122.214;
  }

  ionViewWillEnter() {
    this.initiateMap();
  }

  ionViewDidEnter() {
    this.initiateMap();
    // if(this.item.id) {
      // this.items
      //   .getPaths(this.item.id)
      //   .map(path => {
      //     let formatedPath = [];
      //     if(path) {
      //       path.map(p => {
      //         p['lat'] = p && p.latitude || null;
      //         p['lng'] = p && p.longitude || null;
      //         formatedPath.push(p);
      //       });
      //     }
      //     return formatedPath;
      //   })
      //   .subscribe(
      //     (res: any) => {
      //       if (res) {
      //         this.polylines = res; 
      //       }
      //       this.initiateMap();
      //     }, err => {
      //       this.initiateMap();
      //     },
      //     () => this.initiateMap()
      //   );
    // }
  }

  initiateMap() {
    console.log('initaite map 1');
    this.setCommonPolylineConfig();
    this.map = this.initMap();
    this.setPolylineMap();
    console.log('initaite map');
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

      map.addListener('click', event => {
        this.showButtons = true;
        this.addLatLng(event);
      });
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
    this.currentPolylines = [];
    var path = this.poly.getPath();
    path.push(event.latLng);
    this.paths = path;
    // this.map.then(map => {
    //   var marker = new google.maps.Marker({
    //     position: event.latLng,
    //     title: '#' + path.getLength(),
    //     map: map
    //   });
    // });
  }

  savePath() {
    let polylines = [];
    if(this.paths && this.paths.length > 0) {
      this.paths.forEach((path: any, index) => {
        polylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      });

      // this.navCtrl.push('ItemCreatePage');
      // this.viewCtrl.dismiss();
      let addModal = this.modalCtrl.create('ItemCreatePage', { polylines: polylines });
      addModal.onDidDismiss((item: any, types: any) => {

        if (item) {
          this.items
              .create(item)
              .subscribe(res => {
                // if (res) this.items.push(res);
                console.log('res', res);
                if(res && res.id) {

                  if(types && types.length > 0) {
                    console.log('types', types);
                    types.map(typo => {
                      this.items
                        .createStrollType(res.id, typo)
                        .subscribe(ty => {
                          console.log('pushed');
                        });
                    });
                  }

                  polylines.map(po => {
                    this.items
                      .createPath(po, res.id)
                      .subscribe(
                        p => {
                          console.log('p');
                        }
                      );
                  });
                  // this.viewCtrl.dismiss();
                  this.navCtrl.pop();
                  // this.navCtrl.push('ListMasterPage', {
                  //   item: res,
                  //   user: this.user || null
                  // });
                }
              });
          // this.items.add(item);
        }
      })
      addModal.present();

      // console.log('enter');

      // this.items
      //   .deleteAllPaths(this.item.id)
      //   .subscribe(
      //     p => {
      //       console.log('p', p);
      //     });

      // polylines.map(po => {
      //   this.items
      //     .createPath(po, this.item.id)
      //     .subscribe(
      //       p => {
      //         console.log('p', p);
      //       }
      //     );
      // });
    }
  }

  deleteStroll() {
    const confirm = this.alertCtrl.create({
      title: 'Supprimer le parcours?',
      message: 'En supprimant le parcours, vous ne pourrez pas créer de balade.',
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
            this.showButtons = false;
            this.poly.setMap(null);
            this.initiateMap();

            // this.items
            //   .deleteStroll(this.item.id)
            //   .subscribe(a => {
            //     const toast = this.toastCtrl.create({
            //       position: 'top',
            //       message: 'La balade a été supprimer.',
            //       duration: 3000
            //     });

            //     toast.present();

            //   });
        
          }
        }
      ]
    });

    confirm.present();
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
}
