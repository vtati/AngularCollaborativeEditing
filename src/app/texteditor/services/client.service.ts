import { Injectable} from '@angular/core';
import * as sharedb from 'sharedb/lib/client';
import * as richText from 'rich-text';
import * as ReconnectingWebSocket from 'reconnectingwebsocket';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  socket: any;
  connection: any;
  // richText: any;
  public doc: any;
  constructor() {
    let self=this;
    sharedb.types.register(richText.type);
    // Open WebSocket connection to ShareDB server
    this.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss://' : 'ws://') + environment.sharedbserver + '/sharedb');
    this.connection = new sharedb.Connection(this.socket);


    // Get initial value of document and subscribe to changes
    //this.doc.subscribe(function (a) { alert(this.doc.data) });
  }


}
