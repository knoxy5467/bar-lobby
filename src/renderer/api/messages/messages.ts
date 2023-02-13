import { TSchema } from "@sinclair/typebox";
import { nextTick } from "vue";

import { battleAnnouncementHandlers } from "@/api/messages/battle-announcement-handlers";
import { directAnnouncementHandlers } from "@/api/messages/direct-announcement-handlers";
import { messageHandlers } from "@/api/messages/message-handlers";
import { Message, MessageHandler } from "@/model/messages";

export class MessagesAPI {
    public async handleBattleChat(message: Message) {
        await this.handleMessage(message, messageHandlers);

        // TODO: add option for message handlers to stop messages being added to chat, or filter/manipulate them in some way
        api.session.battleMessages.push(message);
    }

    public async handlePrivateChat(message: Message) {
        await this.handleMessage(message, messageHandlers);
    }

    public async handleBattleAnnouncement(message: Message) {
        await this.handleMessage(message, battleAnnouncementHandlers);

        // TODO: add option for message handlers to stop messages being added to chat, or filter/manipulate them in some way
        api.session.battleMessages.push(message);
    }

    public async handleDirectAnnouncement(message: Message) {
        await this.handleMessage(message, directAnnouncementHandlers);
    }

    protected async handleMessage(message: Message, handlers: MessageHandler<TSchema>[]) {
        const sender = api.session.getUserById(message.senderUserId);
        if (!sender) {
            await api.comms.request("c.user.list_users_from_ids", { id_list: [message.senderUserId], include_clients: true });
            await nextTick();
            this.handleMessage(message, handlers);
            return;
        }

        for (const handler of handlers) {
            if (!handler.regex.test(message.text)) {
                continue;
            }

            if (!handler.handler) {
                return;
            }

            const matches = message.text.match(handler.regex);
            if (!matches) {
                console.error(`Message handler found but matches could not be processed: ${handler}`);
                return;
            }

            let data: Record<string, string> | undefined = {};
            if (handler.validator) {
                data = matches.groups;
                if (!data) {
                    console.error(`Error parsing regex capture groups for message handler: ${handler}`);
                    return;
                }

                const valid = handler.validator(data);
                if (!valid) {
                    console.error(`Message handler failed schema validation: ${handler}`, handler.validator.errors);
                    return;
                }
            }

            return handler.handler(data, message);
        }
    }
}