import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TexteditorComponent } from './texteditor/texteditor.component';
import { QuillEditorModule } from './ngx-quill-editor/quillEditor.module';
import { ClientService } from './texteditor/services/client.service';
import { CursorService } from './texteditor/services/cursorservice.service';

@NgModule({
  declarations: [
    AppComponent,
    TexteditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    QuillEditorModule
  ],
  providers: [ClientService,CursorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
