import { Injectable, EventEmitter } from '@angular/core';
declare var require: any;

// declare var socket:any;
// declare var connection:any;
@Injectable({
  providedIn: 'root'
})
export class ClientService {
  conection: any;
  sharedb: any;
  socket: any;
  connection: any;
  richText: any;
  public doc: any;
  constructor() {
    let self=this;
    this.sharedb = require('sharedb/lib/client');
    this.richText = require('rich-text');
    this.sharedb.types.register(this.richText.type);
    // Open WebSocket connection to ShareDB server
    this.socket = new WebSocket('ws://' + "localhost:5000");
    this.connection = new this.sharedb.Connection(this.socket);

    // Create local Doc instance mapped to 'examples' collection document with id 'counter'
    this.doc = this.connection.get('examples', 'richtext');

    // Get initial value of document and subscribe to changes
    //this.doc.subscribe(function (a) { alert(this.doc.data) });
  }


}
