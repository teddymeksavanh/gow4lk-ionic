import { Injectable } from '@angular/core';

import { Api } from '../api/api';

@Injectable()
export class Notes {

  constructor(public api: Api) { }

  query(params?: any) {
    return this.api.get('notes', params);
  }

  queryAll(params?: any) {
    return this.api.get('allsnotes', params);
  }

  createNote(note: any, strollId: number) {
    return this.api.post(`strolls/${strollId}/notes`, note);
  }

  updateNote(note: any, strollId: number, noteId: any) {
    return this.api.put(`strolls/${strollId}/notes/${noteId}`, note);
  }

  getNotes(strollId: number) {
    return this.api.get(`strolls/${strollId}/notes`);
  }

  deleteNote(strollId: number, noteId: number) {
    return this.api.delete(`strolls/${strollId}/notes/${noteId}`);
  }
}
