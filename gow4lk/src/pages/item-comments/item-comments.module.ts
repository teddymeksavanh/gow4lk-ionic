import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ItemCommentsPage } from './item-comments';

@NgModule({
  declarations: [
    ItemCommentsPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemCommentsPage),
    TranslateModule.forChild()
  ],
  exports: [
    ItemCommentsPage
  ]
})
export class ItemCommentsPageModule { }
