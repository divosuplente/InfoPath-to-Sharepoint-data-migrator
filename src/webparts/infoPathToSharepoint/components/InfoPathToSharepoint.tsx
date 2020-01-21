import * as React from 'react';
import styles from './InfoPathToSharepoint.module.scss';
import { IInfoPathToSharepointProps } from './IInfoPathToSharepointProps';
import { escape } from '@microsoft/sp-lodash-subset';

import Migrator from './Migrator/Migrator';

export default class InfoPathToSharepoint extends React.Component<IInfoPathToSharepointProps, {}> {
  public render(): React.ReactElement<IInfoPathToSharepointProps> {
    return (
      <Migrator />
    );
  }
}
