export interface SermonType {
  id: string;
  title: string;
  bible_text?: string;
  introduction?: string;
  points?: Array<{
    title: string;
    content: string;
    illustrations?: Array<{
      content: string;
      type: string;
    }>;
  }>;
  conclusion?: string;
}