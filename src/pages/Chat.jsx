import React from "react";
import {
  Chat,
  ChannelList,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
  LoadingIndicator,
} from "stream-chat-react";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { useStream } from "../context/StreamContext";
import PageHeader from "../components/PageHeader";

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
      <HiOutlineChatBubbleLeftRight className="h-8 w-8" />
    </div>
    <p className="text-base font-bold text-slate-700">Select a conversation</p>
    <p className="mt-1 max-w-xs text-sm text-slate-400">
      Pick a user from the left to view and reply to their support conversation in real time.
    </p>
  </div>
);

const ChatPage = () => {
  const { chatClient, ready } = useStream();

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title="Support Chat" subtitle="Reply to users in real time" />

      <div className="flex-1 overflow-hidden p-8 pt-6">
        <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!ready || !chatClient ? (
            <div className="flex h-full items-center justify-center">
              <LoadingIndicator />
            </div>
          ) : (
            <Chat client={chatClient} theme="str-chat__theme-light">
              <div className="flex h-full">
                <div className="w-80 shrink-0 overflow-y-auto border-r border-slate-100">
                  <ChannelList
                    filters={{ members: { $in: [chatClient.userID] } }}
                    sort={{ last_message_at: -1 }}
                    options={{ state: true, watch: true, presence: true }}
                  />
                </div>
                <div className="flex-1">
                  <Channel EmptyStateIndicator={EmptyState}>
                    <Window>
                      <ChannelHeader />
                      <MessageList />
                      <MessageComposer />
                    </Window>
                  </Channel>
                </div>
              </div>
            </Chat>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
