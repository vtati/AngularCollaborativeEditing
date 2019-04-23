import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { ClientService } from './services/client.service';
import { CursorService } from './services/cursorservice.service';
import { Utils } from './utils/util';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-texteditor',
  templateUrl: './texteditor.component.html',
  styleUrls: ['./texteditor.component.css']
})
export class TexteditorComponent implements OnInit, AfterViewInit {
  public editor: any;
  public showConnectPanel: boolean = true;
  userlistElem: any;
  usernameElem: any;
  @ViewChild('usernameInput') usernameInputRef: ElementRef;
  // @ViewChild('users-list') userlistInputRef: ElementRef;
  public editorContent: string = '';
  cursorsModule: any;
  public editorOptions: any = {
    placeholder: "insert content..."
  };

  @Input() documentId: string;

  constructor(@Inject(ClientService) private clientService: ClientService,
    @Inject(CursorService) public cursorService: CursorService) {
  }
  ngOnInit() {
    let self = this;
    // Create local Doc instance mapped to 'examples' collection document with id 'counter'
    this.clientService.doc = this.clientService.connection.get(environment.collectionname, this.documentId);

    this.clientService.doc.fetch(function (err) {
      if (err) throw err;
      if (self.clientService.doc.type === null) {
        self.clientService.doc.create([{ insert: 'Hi!' }], 'rich-text');
        return;
      }
      //callback();
    });

    this.clientService.doc.subscribe(function (err) {
      if (err) throw err;
      self.editor.setContents(self.clientService.doc.data);

      self.clientService.doc.on('op', function (op, source) {
        if (source === self.editor) return;
        self.editor.updateContents(op);
      });

      self.clientService.doc.on('nothing pending', self.debouncedSendCursorData);

      self.cursorService.cursorsUpdate.subscribe((data: any) => {
        data.detail.removedConnections.forEach(function (connection) {
          if (self.cursorService.connections[connection.id])
            self.cursorService.connections.splice(connection.id, 1);
        });

        self.updateCursors(data.detail.source);
      });

    });
    
    this.cursorService.configureCursors(this.documentId);
  }

  updateCursors(source) {
    var self = this;
    var activeConnections = {},
      updateAll = Object.keys(self.cursorsModule.cursors).length == 0;

    self.cursorService.connections.forEach(function (connection) {
      if (connection.id != self.cursorService.localConnection.id) {

        // Update cursor that sent the update, source (or update all if we're initting)
        if ((connection.id == source.id || updateAll) && connection.range) {
          self.cursorsModule.setCursor(
            connection.id,
            connection.range,
            connection.name,
            connection.color
          );
        }

        // Add to active connections hashtable
        activeConnections[connection.id] = connection;
      }
    });

    // Clear 'disconnected' cursors
    Object.keys(self.cursorsModule.cursors).forEach(function (cursorId) {
      if (!activeConnections[cursorId]) {
        self.cursorsModule.removeCursor(cursorId);
      }
    });
  }

  debouncedSendCursorData() {
    Utils.debounce(function () {
      var range = this.editor.getSelection();

      if (range) {
        console.log('[cursors] Stopped typing, sending a cursor update/refresh.');
        this.sendCursorData(range);
      }
    }, 1500)
  }

  sendCursorData(range) {
    this.cursorService.localConnection.range = range;
    this.cursorService.update();
  }


  ngAfterViewInit() {
    // this.userlistElem = this.userlistInputRef.nativeElement;
    this.usernameElem = this.usernameInputRef.nativeElement;
  }
  onEditorBlured({ editor, range }) {
    this.sendCursorData(range);
    console.log('editor blur!', editor);
  }

  onEditorFocused({ editor, range }) {
    this.sendCursorData(range);
    console.log('editor focus!', editor);
  }

  onEditorCreated(quill) {
    this.editor = quill;
    this.cursorsModule = quill.getModule('cursors');
    this.cursorsModule.registerTextChangeListener();
    console.log('quill is ready! this is current quill instance object', quill);
  }

  onContentChanged({ editor, html, text, delta, source }) {
    if (source !== 'user') return;
    else {
      var formattingDelta = delta.reduce(function (check, op) {
        return (op.insert || op.delete) ? false : check;
      }, true);

      // If it's not a formatting-only delta, collapse local selection
      if (
        !formattingDelta &&
        this.cursorService.localConnection.range &&
        this.cursorService.localConnection.range.length
      ) {
        this.cursorService.localConnection.range.index += this.cursorService.localConnection.range.length;
        this.cursorService.localConnection.range.length = 0;
        this.cursorService.update();
      }
      this.clientService.doc.submitOp(delta, { source: editor }, function (err: any) {
        if (err)
          console.error('Submit OP returned an error:', err);
      });
    }
  }

  connect_click(event) {
    this.cursorService.localConnection.name = this.usernameElem.value;
    this.cursorService.update();
    this.editor.enable();
    this.showConnectPanel = false;
    // document.getElementById('connect-panel').style.display = 'none';
    // document.getElementById('users-panel').style.display = 'block';
    event.preventDefault();
  }

  trackByFn(index, item) { 
    return item.id; 
  }

}
