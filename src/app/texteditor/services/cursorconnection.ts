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