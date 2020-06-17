/** @format */

//#region Imports NPM
import React, { FC, useContext } from 'react';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesTreeComponentProps, FilesFolderTreeVirtual, FilesFolder } from '@lib/types';
import { ProfileContext } from '@lib/context';
import { FILES_SHARED_NAME } from '@lib/constants';
import { TreeView, TreeItem } from '@front/components/tree-view';
//#endregion

const FilesTreeComponent: FC<FilesTreeComponentProps> = ({ data = [], item, setItem, handleEdit }) => {
  const { user } = useContext(ProfileContext);
  const { t } = useTranslation();

  const USER_FOLDER_ID = user?.username;

  const defaultFolders: FilesFolder[] = [{ pathname: `/${FILES_SHARED_NAME}` }, { pathname: `/${USER_FOLDER_ID}` }];

  const items = [...defaultFolders, ...data]
    .reduce((accumulator: FilesFolderTreeVirtual[], current: FilesFolder) => {
      const { id, pathname } = current;
      const tree = pathname.split('/').filter((i) => !!i);

      if (tree.length === 0) {
        return accumulator;
      }

      const recursive = (childs: FilesFolderTreeVirtual[], array: string[], idx = 0): FilesFolderTreeVirtual[] => {
        const element = childs.find((r) => r.name === array[idx]);

        if (array.length === 1 || array.length - 1 === idx) {
          if (!element) {
            return [...childs, { id, name: array[idx], pathname, childs: [] }];
          }

          element.id = id;
          element.name = array[idx];
          element.pathname = pathname;

          return childs;
        }

        if (element) {
          element.childs = recursive(element.childs, array, idx + 1);

          return childs;
        }

        return [...childs, { id, name: array[idx], pathname, childs: recursive([], array, idx + 1) }];
      };

      return recursive(accumulator, tree);
    }, [])
    .reduce((accumulator: React.ReactElement[], current: FilesFolderTreeVirtual) => {
      const recursive = (child: FilesFolderTreeVirtual, depth = 0): React.ReactNode => {
        const name =
          child.name === FILES_SHARED_NAME
            ? t('files:sharedFolder')
            : child.name === USER_FOLDER_ID
            ? t('files:userFolder')
            : child.name;

        const childs = child.childs.map((c) => recursive(c, depth + 1));

        return (
          <TreeItem
            key={child.pathname}
            nodeId={child.pathname}
            labelText={name}
            id={child.id || '0'}
            active={child.pathname === item}
            parent={childs.length > 0}
            handleEdit={handleEdit}
            depth={depth}
          >
            {childs}
          </TreeItem>
        );
      };

      return [...accumulator, recursive(current)];
    }, []);

  return (
    <TreeView selected={item} setSelected={setItem}>
      {React.Children.map(items, (child: React.ReactElement) => (
        <React.Fragment key={child.key || '0'}>{child}</React.Fragment>
      ))}
    </TreeView>
  );
};

export default FilesTreeComponent;
