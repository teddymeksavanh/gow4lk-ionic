import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { AgmCoreModule } from '@agm/core';
import { PathCreatePage } from './path-create';

@NgModule({
  declarations: [
    PathCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(PathCreatePage),
    TranslateModule.forChild(),
    AgmCoreModule
  ],
  exports: [
    PathCreatePage
  ]
})
export class PathCreatePageModule { }
