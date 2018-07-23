import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Api } from '../api/api';
import { HeadersService } from '../headers/headers';

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  public COOKIE_AUTH_KEY = 'me';
  _user: any;

  constructor(
    public api: Api,
    public cookieService: CookieService,
    public headersService: HeadersService
  ) { 
    if (this.isLogged()) {
      // if a refresh happen, we have to reset headers
      let me: any = this.cookieService.getObject(this.COOKIE_AUTH_KEY);
      let parsedMe: any = JSON.parse(me);
      this.headersService.setSecureHeaders(parsedMe);
      console.log('logged');
      // this.fetchMe();
    }
  }

  // fetchMe(): any {
  //   this.api.get('/me')
  //       .map(re => re['data'])
  //       .subscribe(
  //           me => {
  //               this._user.next(me);
  //               this._roles.next(this.formatRoles(me.roles));
  //               this.buildMenu();
  //           },
  //           error => {
  //               // @todo: replace it by an interceptor when angular is v5+
  //               if (error && error.status === 401) {
  //                   // @todo: do it again, do it better
  //                   if (this.cookieService.getObject('me')) {
  //                       this.cookieService.remove('me');
  //                       window.location.replace('/#/admin/login');
  //                   }
  //               }
  //           }
  //       );
  // }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    let seq = this.api.post('auth/login', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res && res.auth_token) {
        this._loggedIn(res.auth_token);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  update(params?: any) {
    return this.api.put('me', params);
  }

  // updateAvatar(params?: any) {
  //   return this.api.post('me/avatar', params);
  // }

  getMe(params?: any) {
    return this.api.get('me', params);
  }

  // getMeAvatar() {
  //   return this.api.get('me/avatar');
  // }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    
    let seq = this.api.post('signup', accountInfo).share();
    
    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res && res.auth_token) {
        this._loggedIn(res.auth_token);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  setCookie(cookie: any) {
    this.cookieService.putObject(this.COOKIE_AUTH_KEY, JSON.stringify(cookie));
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
    this.headersService.remove('Authorization');
    this.cookieService.remove(this.COOKIE_AUTH_KEY);
    // this.userService.destroy();
  }

  getUser(userId: number) {
    return this.api.get(`users/${userId}`);
  }

  queryAll() {
    return this.api.get(`usersall`);
  }

  queryAllAdmin() {
    return this.api.get(`allsforce`);
  }

  deleteMe(userId) {
    return this.api.delete(`users/${userId}`);
  }

  deleteUser(userId) {
    let params = {};
    params['is_active'] = true;
    return this.api.put(`users/${userId}`, params);
  }

  reactivateUser(userId) {
    let params = {};
    params['is_active'] = false;
    return this.api.put(`users/${userId}`, params);
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this.setCookie(resp);
    this.headersService.setSecureHeaders(resp);
    // this._user = resp.user;
  }

  private isLogged(): boolean {
    if (this.cookieService.getObject(this.COOKIE_AUTH_KEY)) {
        return true;
    }
    return false;
  }
}
