import { Injectable, EventEmitter } from '@angular/core';
import * as ReconnectingWebSocket from 'reconnectingwebsocket';
@Injectable({
  providedIn: 'root'
})

export class CursorConnection {
  id: any;
  range: any;
  name: string;
  color: any;
  documentId: string;

  constructor(name: string, color: any, documentId?: string) {
    this.id = null;
    this.name = name;
    this.color = color;
    this.documentId = documentId;
  }
}

export class CursorService {
  id: any;
  name: string;
  color: string;
  public socket: any;
  public connection: any;
  public localConnection: any;
  public connections: Array<any> = [];
  public cursorsUpdate: EventEmitter<any> = new EventEmitter<any>();
  
  constructor() {
  }

  public configureCursors(documentId:string) {
    var self = this;

    // this.socket = new ReconnectingWebSocket('ws://' + "localhost:5000/cursors");
    this.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://localhost:5000/cursors');
    this.localConnection = new CursorConnection(
      null,
      chance.color({
        format: 'hex'
      }),
      documentId
    );

    this.socket.onopen = function () {
      self.update();
    };

    this.socket.onmessage = function (message) {
      var data = JSON.parse(message.data);

      var source = {},
        removedConnections = [],
        forceUpdate = false,
        reportNewConnections = true;

      if (!self.localConnection.id)
        forceUpdate = true;

      // Refresh local connection ID (because session ID might have changed because server restarts, crashes, etc.)
      self.localConnection.id = data.id;

      if (forceUpdate) {
        self.update();
        return;
      }

      // Find removed connections
      for (var i = 0; i < self.connections.length; i++) {
        var testConnection = data.connections.find(function (connection) {
          return connection.id == self.connections[i].id;
        });

        if (!testConnection) {

          removedConnections.push(self.connections[i]);
          console.log('[cursors] User disconnected:', self.connections[i]);

          // If the source connection was removed set it
          if (data.sourceId == self.connections[i])
            source = self.connections[i];
        } else if (testConnection.name && !self.connections[i].name) {
          console.log('[cursors] User ' + testConnection.id + ' set username:', testConnection.name);
          console.log('[cursors] Connections after username update:', data.connections);
        }
      }

      if (self.connections.length == 0 && data.connections.length != 0) {
        console.log('[cursors] Initial list of connections received from server:', data.connections);
        reportNewConnections = false;
      }

      for (var i = 0; i < data.connections.length; i++) {
        // Set the source if it's still on active connections
        if (data.sourceId == data.connections[i].id)
          source = data.connections[i];

        if (reportNewConnections && !self.connections.find(function (connection) {
          return connection.id == data.connections[i].id
        })) {

          console.log('[cursors] User connected:', data.connections[i]);
          console.log('[cursors] Connections after new user:', data.connections);
        }
      }

      // Update connections array
      self.connections = data.connections.filter(c=>c.documentId === documentId);
      self.cursorsUpdate.emit({
        detail: {
          source: source,
          removedConnections: removedConnections
        }
      });
    };

  }

  update() {
    this.socket.send(JSON.stringify(this.localConnection));
  }


}
