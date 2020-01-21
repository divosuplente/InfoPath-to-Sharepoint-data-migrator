import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'InfoPathToSharepointWebPartStrings';
import InfoPathToSharepoint from './components/InfoPathToSharepoint';
import { IInfoPathToSharepointProps } from './components/IInfoPathToSharepointProps';

export interface IInfoPathToSharepointWebPartProps {
  description: string;
}

export default class InfoPathToSharepointWebPart extends BaseClientSideWebPart<IInfoPathToSharepointWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IInfoPathToSharepointProps > = React.createElement(
      InfoPathToSharepoint,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
