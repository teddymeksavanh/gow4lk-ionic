import { Injectable } from '@angular/core';

import { Api } from '../api/api';

@Injectable()
export class Comments {

  constructor(public api: Api) { }

  query(params?: any) {
    return this.api.get('comments', params);
  }

  createComment(comment: any, strollId: number) {
    return this.api.post(`strolls/${strollId}/comments`, comment);
  }

  updateComment(comment: any, strollId: number, commentId: any) {
    return this.api.put(`strolls/${strollId}/comments/${commentId}`, comment);
  }

  getComments(strollId: number) {
    return this.api.get(`strolls/${strollId}/comments`);
  }


  deleteComment(strollId: number, commentId: number) {
    return this.api.delete(`strolls/${strollId}/comments/${commentId}`);
  }
}
