# Conversation Transfers for Flex

The Conversation Transfers for Flex plugin helps contact center administrators set up transfers of Chats and SMS that use the Conversations API between Agents. 

This plugin is based on [Twilio's chat-sms-transfers-plugin repository](https://github.com/twilio-professional-services/plugin-conversation-transfer) that has been upgraded to be compatible with Flex UI version 2.0, TypeScript and Twilio's new Conversations API.

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. To track the addition of Chat and SMS transfers as a feature, visit the [Flex Release Notes](https://www.twilio.com/docs/flex/release-notes/flex-ui-release-notes-for-v2xx) page.**

---

## Set up

### Requirements

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 12 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
  ```bash
  # Install the Twilio CLI
  npm install twilio-cli -g
  # Install the Serverless and Flex as Plugins
  twilio plugins:install @twilio-labs/plugin-serverless
  twilio plugins:install @twilio-labs/plugin-flex
  ```

### Contributing

All contributions and improvements to this plugin are welcome! To run the tests of the plugin: `npm run test`.

### Twilio Account Settings

Before we begin, we need to collect
all the config values we need to run this Flex plugin:

| Config&nbsp;Value | Description                                                                                                                                            |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                   |
| Auth Token        | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console).                   |
| Workspace SID     | Your Flex Task Assignment workspace SID - find this [in the Console TaskRouter Workspaces page](https://www.twilio.com/console/taskrouter/workspaces). |


## Plugin Details

The Conversations Transfers for Flex plugin adds a **Transfer** button near the **End Chat** button that comes out of the box with Flex. Clicking this button opens up the default [WorkerDirectory Flex component](https://www.twilio.com/docs/flex/ui/components#workerdirectory) with Agents and Queues tabs. Upon selecting an agent or a queue, this plugin will initiate a transfer of the chat task to the specified worker (agent) or queue.

Because Flex does not natively support chat and SMS transfers, this plugin works by leveraging the Interaction and Invite Resources provided by the Conversations API; a new conversation invite is created for the transfer target and the status of the current agent will be set to `completed` in the interaction. The invite will create a new task, routing it through your workflow as normal.

It is up to you to implement the necessary TaskRouter routing rules to send the task to the specified queue or worker. To aid you in this, one new attribute within [`functions/transfer-chat.js`](functions/functions/transfer-chat.js) will be added to your tasks: `targetSid`. This will help the function set the correct attributes for the new invitiation, so that it can be routed correctly to the target.

| Attribute            | Expected Setting                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetSid`          | Worker or Queue Sid which will be used to determine if you are transferring to a worker or a queue.                                                                                                                                                                                                                                                                  |

---

### Local development

After the above requirements have been met:

1. Clone this repository.

    ```bash
    git clone git@github.com:twilio-professional-services/plugin-conversation-transfer.git
    ```

2. Install dependencies.

  ```bash
  npm install
  ```

3. [Deploy your Twilio Function](#twilio-serverless-deployment).

4. Set your environment variables.

    ```bash
    npm run setup
    ```

See [Twilio Account Settings](#twilio-account-settings) to locate the necessary environment variables.

5. Run the application.

    ```bash
    twilio flex:plugins:start
    ```

6. Navigate to [http://localhost:3000](http://localhost:3000).

That's it!

### Twilio Serverless deployment

You need to deploy the function associated with the Chat and SMS Transfers plugin to your Flex instance. The function is called from the plugin you will deploy in the next step and integrates with TaskRouter, passing in required attributes to perform the chat transfer.

#### Pre-deployment Steps

1. Change into the functions directory and rename `.env.example`.

    ```bash
    cd functions && cp .env.example .env
    ```

2. Open `.env` with your text editor and set the environment variables mentioned in the file.

    ```
    TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    TWILIO_AUTH_TOKEN=9yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    TWILIO_WORKSPACE_SID=WSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    ```

3. Deploy the Twilio function to your account using the Twilio CLI:
  
    ```bash
    cd functions && twilio serverless:deploy
    
    # Example Output
    # Deploying functions & assets to the Twilio Runtime
    # ⠇ Creating 1 Functions
    # ✔ Serverless project successfully deployed
    
    # Deployment Details
    # Domain: https://plugin-conversation-transfer-functions-xxxx-dev.twil.io
    # Service:
    #    chat-transfer (ZSxxxx)
    # ..
    ```

4. Copy and save the domain returned when you deploy a function. You will need it in the next step.

If you forget to copy the domain, you can also find it by navigating to [Functions > API](https://www.twilio.com/console/functions/api) in the Twilio Console.

> Debugging Tip: Pass the `-l` or logging flag to review deployment logs.

### Flex Plugin Deployment

Once you have deployed the function, it is time to deploy the plugin to your Flex instance.

You need to modify the source file to mention the serverless domain of the function that you deployed previously.

1. In the main directory rename `.env.example`.

    ```bash
    cp .env.example .env
    ```
2. Open `.env` with your text editor and set the environment variables mentioned in the file.

    ```
    # Paste the Function deployment domain
    REACT_APP_SERVERLESS_FUNCTION_DOMAIN='https://plugin-conversation-transfer-functions-xxxx-dev.twil.io';
    ```
3. When you are ready to deploy the plugin, run the following in a command shell:

    ```bash
    twilio flex:plugins:deploy --major --changelog "Update the plugin to use Builder v4" --description "Chat and SMS Cold Transfers in Flex"
    ```

#### Example Output

```
✔ Validating deployment of plugin plugin-conversation-transfer
⠧ Compiling a production build of plugin-conversation-transferPlugin plugin-conversation-transfer was successfully compiled with some warnings.
✔ Compiling a production build of plugin-conversation-transfer
✔ Uploading plugin-conversation-transfer
✔ Registering plugin plugin-conversation-transfer with Plugins API
✔ Registering version v2.0.0 with Plugins API

🚀 Plugin (private) plugin-conversation-transfer@2.0.0 was successfully deployed using Plugins API

Next Steps:
Run $ twilio flex:plugins:release --plugin plugin-conversation-transfer@2.0.0 --name "Autogenerated Release 1602189036080" --description "The description of this Flex Plugin Configuration" to enable this plugin on your Flex application
```

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test Chat and SMS transfers on your Flex application!

---

## Changelog

### 1.0.0

**March 31, 2023**

- First release of plugin

## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. The author bears no responsibility to support the use or implementation of this software.
