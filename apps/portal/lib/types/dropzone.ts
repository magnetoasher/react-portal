/** @format */

import { WithTranslation } from 'next-i18next';

export interface DropzoneFile {
  file: File;
  id: string;
  preview: string;
}

export interface DropzoneProps extends WithTranslation {
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  filesLimit?: number;
  acceptedFiles?: string[];
  maxFileSize?: number;
  color?: 'primary' | 'secondary';
}
