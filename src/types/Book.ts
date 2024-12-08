export interface Book {
  title: string;
  author: string;
  rating?: number;
  description?: string;
  coverUrl?: string;
  id?: string;
  isbn?: string;
}

export interface DetectedBook extends Book {
  inReadingList: boolean;
  isRead: boolean;
}

export interface ReadingList {
  toRead: Book[];
  read: Book[];
}