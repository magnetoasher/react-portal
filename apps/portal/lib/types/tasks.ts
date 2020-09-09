/** @format */

import React from 'react';
import { ApolloQueryResult, ApolloError, QueryLazyOptions } from '@apollo/client';
import type { TkUser, TkTask, TkEditTask, TkTasks, TkFileInput, TkFile, TkWhere } from './tickets';
import { StyleProps as StyleProperties, Data } from './common';
import { DropzoneFile } from './dropzone';

export interface TasksComponentProps {
  loading: boolean;
  tasks: (TkTask | null)[];
  status: string;
  search: string;
  tasksRefetch: () => Promise<ApolloQueryResult<Data<'TicketsTasks', TkTasks>>>;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TasksCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  task: TkTask;
}

export interface TaskComponentProps {
  loading: boolean;
  loadingTaskFile: boolean;
  loadingCommentFile: boolean;
  taskRefetch: () => Promise<ApolloQueryResult<Data<'TicketsTaskDescription', TkEditTask>>>;
  task?: TkTask;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleDownload: (task: TkTask, file: TkFile) => void;
  handleComment: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleAccept: () => void;
  handleClose: () => void;
}

export interface TaskInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  // TODO: !!! STRING THERE !!!
  profile?: TkUser | string;
}
