import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { UserCardPage } from './user-card';

import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FintTheme from 'fusioncharts/themes/fusioncharts.theme.fint';
import { FusionChartsModule } from 'angular4-fusioncharts';

FusionChartsModule.fcRoot(FusionCharts, Charts, FintTheme);

@NgModule({
  declarations: [
    UserCardPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCardPage),
    TranslateModule.forChild(),
    FusionChartsModule
  ],
  exports: [
    UserCardPage
  ]
})
export class UserCardPageModule { }
