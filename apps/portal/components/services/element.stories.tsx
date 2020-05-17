/** @format */

import React from 'react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Service1 from '@public/images/svg/itapps/app_1.svg';
import Service2 from '@public/images/svg/itapps/app_2.svg';
import { story, withTranslation } from './index.stories';
import Element from './element';

const Story = withTranslation('services', Element);

story.add('Element', () => (
  <>
    <Story
      element={{
        code: text('Code1', '1'),
        name: text('Name1', 'Сервис 1'),
        subtitle: text('Subtitle1', ''),
        avatar: Service1,
      }}
      favorite
      setFavorite={action('Favorite')}
    />
    <Story
      element={{
        code: text('Code2', '2'),
        name: text('Name2', 'Сервис 2'),
        subtitle: text('Subtitle2', 'подзаголовок'),
        avatar: Service2,
      }}
      favorite={false}
    />
  </>
));
