import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { ClientService } from './client.service';

@Component({
  selector: 'app-texteditor',
  templateUrl: './texteditor.component.html',
  styleUrls: ['./texteditor.component.css']
})
export class TexteditorComponent implements OnInit {
  public editor: any;
  public editorContent: string = '';
  public editorOptions: any = {
    placeholder: "insert content..."
  };

  constructor(@Inject(ClientService) private clientService: ClientService) {
    let self = this;
    this.clientService.doc.subscribe(function (err) {
      if (err) throw err;
      self.editor.setContents(self.clientService.doc.data);

      self.clientService.doc.on('op', function (op, source) {
        if (source === self.editor) return;
        self.editor.updateContents(op);
      });

    });
  }

  ngOnInit() {
  }
  onEditorBlured(quill) {
    console.log('editor blur!', quill);
  }

  onEditorFocused(quill) {
    console.log('editor focus!', quill);
  }

  onEditorCreated(quill) {
    this.editor = quill;
    console.log('quill is ready! this is current quill instance object', quill);
  }

  onContentChanged({ editor, html, text, delta, source }) {
    if (source !== 'user') return;
    this.clientService.doc.submitOp(delta, { source: editor });
  }

}
