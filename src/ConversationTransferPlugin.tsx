import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { transferOverride } from './actions/transferOverride';
import TransferButton from './components/TransferButton/TransferButton';

const PLUGIN_NAME = 'ConversationTransferPlugin';

export default class ConversationTransferPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  private setupComponents() {
    Flex.TaskCanvasHeader.Content.add(
      <TransferButton 
        onClick={() => Flex.Actions.invokeAction('ShowDirectory')}
        key="chat-transfer-button" 
      />, {
      sortOrder: 1,
      if: (props) => {
        return props.channelDefinition.capabilities.has('Chat') && props.task.taskStatus === 'assigned'
      },
    });
  }

  private setupActions() {
    Flex.Actions.replaceAction('TransferTask', (payload: any, original: Flex.ActionFunction) => transferOverride(payload, original));
  }

  private setupNotifications(manager: Flex.Manager) {
    // @ts-ignore
    manager.strings.chatTransferFetchError = 'Failed to transfer chat. Reason: {{message}}'

    Flex.Notifications.registerNotification({
      id: 'chatTransferFetchError',
      content: 'chatTransferFetchError',
      type: Flex.NotificationType.error,
    });
  }
  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    this.setupComponents();
    this.setupActions();
    this.setupNotifications(manager);
  }
}
