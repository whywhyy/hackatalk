import 'react-native';

import * as React from 'react';

import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils';
import {
  createMockNavigation,
  createTestElement,
} from '../../../../test/testUtils';
import {fireEvent, render} from '@testing-library/react-native';

import {Channel} from '../../../types/graphql';
import MainChannel from '../MainChannel';
import {getString} from '../../../../STRINGS';
import mockReactNavigation from '@react-navigation/core';

const mockNavigation = createMockNavigation();

jest.mock('@react-navigation/core', () => ({
  ...jest.requireActual<typeof mockReactNavigation>('@react-navigation/core'),
  useNavigation: () => mockNavigation,
}));

const mockEnvironment = createMockEnvironment();

mockEnvironment.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, {
    Channel: (_, generateId): Channel => ({
      id: `test-channel-${generateId()}`,
      name: 'HackaTalk',
      channelType: 'private',
      lastMessage: {
        id: 'test-message-3848',
        messageType: 'text',
        createdAt: '2021-03-19T05:13:22.932Z',
      },
      messages: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }),
  }),
);

describe('[Channel] screen', () => {
  it('renders without crashing', () => {
    const component = createTestElement(<MainChannel />, {
      environment: mockEnvironment,
    });

    const screen = render(component);
    const json = screen.toJSON();

    expect(json).toBeTruthy();
    expect(json).toMatchSnapshot();
  });
});

describe('interactions', () => {
  it('should simulate [ChannelListItem] onPress', async () => {
    const component = createTestElement(<MainChannel />, {
      environment: mockEnvironment,
    });

    const screen = render(component);
    const channelItemBtn = await screen.findByA11yLabel(getString('GO_CHAT'));

    fireEvent.press(channelItemBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'Message',
      expect.objectContaining({channelId: expect.any(String)}),
    );
  });

  it('should simulate FAB Button onPress', async () => {
    const component = createTestElement(<MainChannel />, {
      environment: mockEnvironment,
    });

    const screen = render(component);
    const fabBtn = screen.getByTestId('channel-create-fab');

    fireEvent.press(fabBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ChannelCreate');
  });
});
