// import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges } from '@angular/core';
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { Items } from '../../providers';
// declare const google: any;
// import { LatLngLiteral, MapsAPILoader } from '@agm/core';
// import { each, chunk, has } from 'lodash';

// @IonicPage()
// @Component({
//   selector: 'page-item-detail',
//   templateUrl: 'item-detail.html'
// })
// export class ItemDetailPageWorking {
//   item: any;

//   title: string = 'My first AGM project';
//   lat: number = 49.8566;
//   lng: number = 4.3522;
//   zoom: number = 15;

//   paths: LatLngLiteral[];
//   selectedShape: any;
//   @Input() withOutsideActionButtons = true;
//   @Input() withInsideActionButtons = false;

//   @Input() polylines: any[];
//   private map: Promise<any>;
//   private mapBounds: any;
//   private commonPolylineConfig: any = {};
//   @Input() readonly = false;
//   @Input() emitOnOverlayComplete = false;
//   @Input() polylineDraggable = false;
//   @Input() polylineEditable = false;
//   private currentPolylines: any[] = [];

//   @Output() onPolylineDrawn = new EventEmitter();

//   constructor(
//     public navCtrl: NavController,
//     navParams: NavParams,
//     public items: Items,
//     private mapLoader: MapsAPILoader,
//     private cd: ChangeDetectorRef,
//   ) {
//     this.item = navParams.get('item') || [];
//     this.lat = 37.772;
//     this.lng = -122.214;
//   }

//   ionViewDidLoad() {
//     if(this.item.id) {
//       this.items
//         .getPaths(this.item.id)
//         .map(path => {
//           let formatedPath = [];
//           if(path) {
//             path.map(p => {
//               p['lat'] = p && p.latitude || null;
//               p['lng'] = p && p.longitude || null;
//               formatedPath.push(p);
//             });
//           }
//           return formatedPath;
//         })
//         .subscribe(
//           (res: any) => {
//             if (res) {
//               this.polylines = res; 
//             }
//             this.initiateMap();
//           }, err => {
//             this.initiateMap();
//           },
//           () => this.initiateMap()
//         );
//     }
//   }

//   initiateMap() {
//     this.setCommonPolylineConfig();
//     this.map = this.initMap();
//     this.map.then(map => {
//       if (this.polylines && this.polylines.length > 0) {
//         this.preparePolylineToDraw(this.polylines);
//       }
//     });
//   }

//   preparePolylineToDraw(polylines: any): void {
//     if (polylines && polylines.length > 0) {
//       // const googlePolyline = new google.maps.Polyline(
//       //   Object.assign(
//       //     {
//       //       paths: polylines,
//       //     },
//       //     this.commonPolylineConfig
//       //   )
//       // );

//       const googlePolyline = new google.maps.Polyline({
//           path: polylines,
//           geodesic: true,
//           strokeColor: 'red',
//           strokeOpacity: 1,
//           strokeWeight: 5
//       });
//       const finalPolylineObject = Object.assign(
//         {},
//         {
//           id: polylines.id,
//           polyline: googlePolyline
//         }
//       );
//       // console.log('finalPolyline', finalPolylineObject);
//       if (this.readonly === false) {
//         this.attachClickEventOnPolyline(googlePolyline);
//         this.attachInsertAtEventOnPolyline(googlePolyline);
//         this.attachSetAtEventOnPolyline(googlePolyline);
//       }
//       // console.log('formatted', formattedPolyline);
//       this.drawPolyline(googlePolyline);
//       this.addPolylineToCollection(finalPolylineObject);
//     }
//   }

//   setCommonPolylineConfig() {
//     this.commonPolylineConfig = {
//       strokeColor: 'red',
//       strokeOpacity: 1,
//       strokeWeight: 5,
//       // fillColor: '#000000',
//       // fillOpacity: 1,
//       editable: true,
//       draggable: true,
//       geodesic: true,
//     }
//   }

//   initBounds = () => new google.maps.LatLngBounds();

//   // initDrawingManager(googleMap: any): any {
//   //   const drawingManager = new google.maps.drawing.DrawingManager({
//   //     drawingMode: google.maps.drawing.OverlayType.POLYLINE,
//   //     drawingControl: true,
//   //     drawingControlOptions: {
//   //       position: google.maps.ControlPosition.TOP_CENTER,
//   //       drawingModes: ['polyline']
//   //     },
//   //     polylineOptions: this.commonPolylineConfig
//   //   });
//   //   drawingManager.setMap(googleMap);
//   //   return drawingManager;
//   // }

//   drawPolyline(polylines: any): void {
//     this.map.then((map) => {
//       // console.log('polyline', polylines);
//       polylines.setMap(map);
//       // polylines.getPath().forEach((path, index) => {
//       //   this.mapBounds.extend(path);
//       // });
//       // map.fitBounds(this.mapBounds);
//     });
//   }

//   initMap(): Promise<any> {
//     return new Promise((resolve, reject) => {
//       this.mapLoader.load().then(() => {
//         const map = new google.maps.Map(document.getElementById('map'), {
//           center: new google.maps.LatLng(this.lat, this.lng),
//           zoom: this.zoom,
//           mapTypeId: google.maps.MapTypeId.ROADMAP,
//           scrollwheel: false
//         });

//         this.mapBounds = this.initBounds();
//         let drawingManager = null;
//         if (this.readonly === false) {
          
//           const drawingManager = new google.maps.drawing.DrawingManager({
//             // drawingMode: google.maps.drawing.OverlayType.POLYLINE,
//             drawingMode: null,
//             drawingControl: true,
//             drawingControlOptions: {
//               position: google.maps.ControlPosition.BOTTOM_CENTER,
//               drawingModes: ['polyline']
//             },
//             polylineOptions: this.commonPolylineConfig
//           });
//           drawingManager.setMap(map);

//           google.maps.event.addListener(
//             drawingManager,
//             'overlaycomplete',
//             event => {
//               const polyline = event.overlay;
//               if (event.type == 'polyline') {
//                 this.clearSelection();
//                 if (drawingManager) {
//                   drawingManager.setDrawingMode(null);
//                 }
//                 this.attachClickEventOnPolyline(polyline);

//                 this.attachInsertAtEventOnPolyline(polyline);

//                 this.attachSetAtEventOnPolyline(polyline);

//                 this.addPolylineToCollection({polyline: polyline});
//                 this.selectShape(polyline, event);
//                 if (this.emitOnOverlayComplete) {
//                   this.fromMapPathsToDB();
//                 }
//               }
//             }
//           );
//         }
//         resolve(map);
//       });
//     });
//   }

//   addPolylineToCollection = (polyline: any): any => {
//     this.currentPolylines.push(polyline);
//     if (this.emitOnOverlayComplete) {
//       this.fromMapPathsToDB();
//     }
//   }

//   // set_at is fired when we modify polyline area from highlighted edges
//   // (fire a lot of events when dragging the shape...)
//   attachSetAtEventOnPolyline(polyline): void {
//     google.maps.event.addListener(polyline.getPath(), 'set_at', () => {
//       if (this.emitOnOverlayComplete) {
//         this.fromMapPathsToDB();
//       }
//     });
//   }

// formatCompanyActionZonesToMapPaths(polyline: any): any {
//     const latLn: LatLngLiteral[] = [];
//     each(chunk(polyline, 2), (p, i) => latLn.push({lat: Number(p[0]), lng: Number(p[1])}));
//     return latLn;
// }

// // Handling polyline format for planet /call
// formatPlanetCoordinatesToMapPaths(coordinates: any): any {
//     let polyline = [];
//     if (coordinates) {
//       console.log('coordinates', coordinates);
//         for (let index = 0; index < coordinates.length; index++) {
//             const element = coordinates[index];
//             for (let i = 0; i < element.length; i++) {
//                 const e = element[i];
//                 polyline.push({ lat: Number(e[1]), lng: Number(e[0]) })
//             }
//         }
//         return {polyline: polyline};
//     }
//     return polyline;
// }

// // Format the polyline to send to the API => should be generic
// formatMapPathsToDb(polylinesFromMap: any): any {
//     const polylinesToDb = [];
//     if (polylinesFromMap && polylinesFromMap.length > 0 ) {
//       polylinesFromMap.forEach((polyline, i) => {
//           const poly = polyline.polyline;
//           let polylineesToPush = [];
//           let polylineObject = {};
//           poly.getPath().forEach((path, index) => {
//               polylineesToPush.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng}));
//               polylineesToPush.push(path.lng());
//           });
//           if (polyline.id) {
//               polylineObject['id'] = polyline.id;
//           }
//           polylineObject['polyline'] = polylineesToPush;
//           polylinesToDb.push(polylineObject);
//       });
//     }
//     // send result to parent
//     return polylinesToDb;
// }


//   attachClickEventOnPolyline(polyline): void {
//     google.maps.event.addListener(polyline, 'click', event => {
//       this.clearSelection();
//       this.selectShape(polyline, event);
//     });
//   }

//   private selectShape(shape, event) {
//     this.selectedShape = shape;
//     shape.setEditable(true);
//     shape.setOptions({
//       strokeColor: '#00b4ab',
//       fillColor: '#00b4ab'
//     });
//     this.cd.detectChanges();
//   }

//   // insert_at is fired when we drag point that is between highlighted edges
//   attachInsertAtEventOnPolyline(polyline): void {
//     google.maps.event.addListener(polyline.getPath(), 'insert_at', () => {
//       if (this.emitOnOverlayComplete) {
//         this.fromMapPathsToDB();
//       }
//     });
//   }

//   submitPolyline() {
//     this.fromMapPathsToDB();
//   }

//   removeSelectedShape() {
//     if (this.selectedShape) {
//       const foundPolylineIdx = this.currentPolylines.findIndex(
//         p => this.selectedShape === p.polyline
//       );
//       if (foundPolylineIdx !== -1) {
//         this.currentPolylines.splice(foundPolylineIdx, 1);
//       }
//       this.selectedShape.setMap(null);
//       this.selectedShape = null;
//       this.cd.detectChanges();
//     }
//   }

//   private clearSelection() {
//     if (this.selectedShape) {
//       this.selectedShape.setEditable(false);
//       this.selectedShape.setOptions({
//         strokeColor: '#000000',
//         fillColor: '#000000'
//       });
//       this.selectedShape = null;
//       if (this.withInsideActionButtons) {
//         this.fromMapPathsToDB();
//       }
//       this.cd.detectChanges();
//     }
//   }

//   fromDBToMapPaths(polylines: any[]): LatLngLiteral[] {
//     let latLn: LatLngLiteral[] = [];
//     each(chunk(polylines, 2), (polyline, i) =>
//       latLn.push({ lat: Number(polyline[0]), lng: Number(polyline[1]) })
//     );
//     return latLn;
//   }

//   fromMapPathsToDB(): void {
//     const polylinesToDb = [];
//     if (this.currentPolylines && this.currentPolylines.length > 0 ) {
//       console.log('currentPol', this.currentPolylines);
//         const curr = this.currentPolylines[0];
//         const poly = curr.polyline;
//         let polylineesToPush = [];
//         let polylineObject = {};
//         poly.getPath().forEach((path, index) => {
//             // polylineesToPush.push(path.lat());
//             // polylineesToPush.push(path.lng());
//             polylineesToPush.push(Object.assign({}, {latitude: path.lat(), longitude: path.lng()}));
//         });
//         if (curr.id) {
//             polylineObject['id'] = curr.id;
//         }
//         // polylineObject['polyline'] = polylineesToPush;
//         // console.log('polylinesToDb', polylineObject);
//         // polylinesToDb.push(polylineObject);
//         console.log('polylinees', polylineesToPush);
//         polylinesToDb.push(polylineesToPush);
//     }
//     // send result to parent
//     this.onPolylineDrawn.emit(polylinesToDb);
//     polylinesToDb.map(pp => {
//       console.log('pp', pp);
//       pp.map(p => {
//         this.items
//           .createPath(p, this.item.id)
//           .subscribe(pol => {
//             console.log('pol', pol);
//           });
//       });
//     });
//   }

//   addPath() {
//     console.log('test');
//   }

// }
