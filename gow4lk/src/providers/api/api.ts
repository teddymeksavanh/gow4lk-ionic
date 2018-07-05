import { HttpParams } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { HeadersService } from '../headers/headers';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'http://0.0.0.0:3000';

  constructor(
    public http: Http,
    public headersService: HeadersService
  ) { }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    const req =
      this.http
          .get(this.url + '/' + endpoint, this.headersService.tokened())
          .map((httpResp: any) => {
            return this._formatResp(httpResp);
          });
    return req;
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    console.log('posted');
    const req =
      this.http
          .post(this.url + '/' + endpoint, body, this.headersService.tokened())
          .map((httpResp: any) => {
            console.log('httpResp', httpResp);
            return this._formatResp(httpResp);
          });
    return req;
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
  }

  private _formatResp(resp: any) {
    let result;
    if (resp && resp._body) {
      result = JSON.parse(resp._body);
    } else {
      result = resp;
    }
    return result;
  }
}
