/** @format */

import { FilesFolder } from '@app/portal/files/models/files.folder.dto';
import { DropzoneFile } from '../dropzone/types';

export interface FilesComponentProps {
  fileLoading: boolean;
  folderLoading: boolean;
  fileData?: FilesQueryProps[];
  folderData?: FilesFolder[];
  folderName: string;
  setFolderName: React.Dispatch<React.SetStateAction<string>>;
  showDropzone: boolean;
  handleOpenDropzone: () => void;
  handleEditFolder: (_: string, __: number, ___?: string) => void;
  openFolderDialog: number;
  folderDialogName: string;
  handleFolderDialogName: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAcceptFolderDialog: (_: number) => void;
  handleCloseFolderDialog: () => void;
  attachments: DropzoneFile[];
  setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleUploadFile: () => void;
}

export interface FilesTreeComponentProps {
  data?: FilesFolder[];
  item: string;
  handleEdit: (_: string, __: number, ___?: string) => void;
  setItem: React.Dispatch<React.SetStateAction<string>>;
}

export interface FilesQueryProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  file: string;
  content: Buffer;
}

export type FilesFolderTreeVirtual = {
  id?: string;
  name: string;
  pathname: string;
  childs: FilesFolderTreeVirtual[];
};

export type FilesDialogComponentProps = {
  open: number;
  input: string;
  handleAccept: (_: number) => void;
  handleInput: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleClose: () => void;
};

export type FolderDialogState = {
  id?: string;
  pathname: string;
  name: string;
};
