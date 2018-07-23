import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ItemTypesPage } from './item-types';

@NgModule({
  declarations: [
    ItemTypesPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemTypesPage),
    TranslateModule.forChild()
  ],
  exports: [
    ItemTypesPage
  ]
})
export class ItemTypesPageModule { }
