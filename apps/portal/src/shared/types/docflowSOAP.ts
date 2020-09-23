/** @format */

import type React from 'react';
import { TFunction } from 'next-i18next';

export interface DocFlowTargetSOAP {
  name?: string;
  objectID: {
    id?: string;
    presentation?: string;
    type?: string; // DMInternalDocument
    navigationRef?: string;
  };
}

export interface DocFlowTargetCollectionSOAP {
  allowDeletion: boolean;
  name: string;
  role: {
    name: string;
    objectID: {
      id: string;
      navigationRef?: string;
      presentation?: string;
      type?: string; // 'DMBusinessProcessTargetRole';
    };
  };
  target: {
    name: string;
    objectID: {
      id: string;
      navigationRef?: string;
      presentation?: string;
      type?: string; // 'DMInternalDocument';
    };
  };
}

export interface DocFlowFileVersionSOAP {
  name?: string;
  objectID: {
    id: string;
    presentation?: string;
    type?: string; // 'DMFileVersion'
    navigationRef?: string;
  };
}

export interface DocFlowFileListSOAP {
  name?: string;
  objectID: {
    id: string;
    type?: string; // 'DMFile'
  };
  author?: DocFlowUserSOAP;
  creationDate?: Date;
  description?: string;
  editing?: boolean;
  encrypted?: boolean;
  extension?: string;
  modificationDateUniversal?: Date;
  signed?: boolean;
  size?: number;
  activeVersion?: DocFlowFileVersionSOAP;
}

export interface DocFlowUserSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMUser';
  };
}

export interface DocFlowImportanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessTaskImportance';
  };
}

export interface DocFlowProcessAcquaintanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessAcquaintance';
  };
}

export interface DocFlowStateSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessState';
  };
}

export interface DocFlowInternalDocumentSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMInternalDocument';
  };
}

export interface DocFlowTaskSOAP {
  canHaveChildren?: boolean;
  isFolder?: boolean;
  object: {
    name?: string;
    acceptDate?: Date;
    accepted?: boolean;
    attributes?: {
      type?: string; // 'DMBusinessProcessTask';
    };
    author?: DocFlowUserSOAP;
    beginDate?: Date;
    businessProcessStep?: string;
    changeRight?: boolean;
    description?: string;
    dueDate?: Date;
    endDate?: Date;
    executed?: boolean;
    executionComment?: string;
    executionMark?: string;
    importance?: DocFlowImportanceSOAP;
    objectID?: {
      id?: string;
      navigationRef?: string;
      presentation?: string;
      type?: string; // 'DMBusinessProcessTask';
    };
    parentBusinessProcess?: DocFlowProcessAcquaintanceSOAP;
    performer?: {
      user?: DocFlowUserSOAP;
    };
    state?: DocFlowStateSOAP;
    target?: DocFlowTargetSOAP;
    targets?: {
      items?: DocFlowTargetCollectionSOAP[];
    };
  };
}

export interface DocFlowTasksSOAP {
  items: DocFlowTaskSOAP[];
}
