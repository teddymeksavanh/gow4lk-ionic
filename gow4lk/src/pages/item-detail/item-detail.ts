import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Items } from '../../providers';
import { ToastController } from 'ionic-angular';
declare const google: any;
import { LatLngLiteral, MapsAPILoader } from '@agm/core';
export const Tab1Root = 'ListMasterPage';
// import { each, chunk, has } from 'lodash';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  user: any;
  title: string = 'My first AGM project';
  lat: number = 49.8566;
  lng: number = 4.3522;
  zoom: number = 17;

  paths: LatLngLiteral[];
  selectedShape: any;
  @Input() withOutsideActionButtons = true;
  @Input() withInsideActionButtons = false;
  @Input() polylines: any[];
  poly: any;
  // map: any;
  private map: Promise<any>;
  private mapBounds: any;
  private commonPolylineConfig: any = {};
  @Input() readonly = false;
  @Input() emitOnOverlayComplete = false;
  @Input() polylineDraggable = false;
  @Input() polylineEditable = false;
  private currentPolylines: any[] = [];

  @Output() onPolylineDrawn = new EventEmitter();

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    navParams: NavParams,
    public items: Items,
    public toastCtrl: ToastController,
    private mapLoader: MapsAPILoader,
    private cd: ChangeDetectorRef,
  ) {
    this.item = navParams.get('item') || [];
    this.user = navParams.get('user') || null;
    this.lat = 37.772;
    this.lng = -122.214;
  }

  ionViewDidLoad() {
    if(this.isAdmin()) {
      this.polylineEditable = true;
      this.polylineDraggable = true;
    }
    if(this.item.id) {
      this.items
        .getPaths(this.item.id)
        .map(path => {
          let formatedPath = [];
          if(path) {
            path.map(p => {
              p['lat'] = p && p.latitude || null;
              p['lng'] = p && p.longitude || null;
              formatedPath.push(p);
            });
          }
          return formatedPath;
        })
        .subscribe(
          (res: any) => {
            if (res) {
              this.polylines = res; 
            }
            this.initiateMap();
          }, err => {
            this.initiateMap();
          },
          () => this.initiateMap()
        );
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

      if(this.isAdmin()) {
        map.addListener('click', event => {
          this.addLatLng(event);
        });
      } else {
        map.addListener('onLoad', event => {
          this.addLatLng(event);
        });
      }
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
      editable: this.polylineEditable,
      draggable: this.polylineDraggable,
      geodesic: true,
    }
  }

  addLatLng(event) {
    var path = this.poly.getPath();
    path.push(event.latLng);
    this.paths = path;
    this.map.then(map => {
      var marker = new google.maps.Marker({
        position: event.latLng,
        // animation: google.maps.Animation.DROP,
        title: '#' + path.getLength(),
        map: map
      });
    });
  }

  savePath() {
    let polylines = [];
    if(this.paths && this.paths.length > 0) {
      this.paths.forEach((path: any, index) => {
        polylines.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
      });
      polylines.map(po => {
        this.items
          .createPath(po, this.item.id)
          .subscribe(
            p => {
              console.log('p', p);
            }
          );
      });
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
}
