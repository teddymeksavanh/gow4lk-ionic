import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class HeadersService {
    headers: Headers = new Headers();
    private _secureHeaders;
    get secureHeaders() { return this._secureHeaders; }

    constructor() {
        this.setJsonHeaders();
    }

    public setJsonHeaders() {
        this.remove('Content-Type');
        this.remove('Accept');
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    /**
     * name
     */
    public setContentType(contentType: string) {
        this.headers.delete('Content-Type');
        this.headers.append('Content-Type', contentType);
    }

    public remove(key: string): void {
        this.headers.delete(key);
    }

    public tokened(): RequestOptions {
        return new RequestOptions({ headers: this.headers });
    }

    public append(key: string, value: string) {
        this.headers.append(key, value);
    }

    public setSecureHeaders(token: any): void {
        this._secureHeaders = `${token}`;
        this.headers.set('Authorization', `${token}`);
    }

}
