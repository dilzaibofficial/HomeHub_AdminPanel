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
  useChatContext,
} from "stream-chat-react";
import { HiOutlineChatBubbleLeftRight, HiOutlineArrowLeft } from "react-icons/hi2";
import { useStream } from "../context/StreamContext";
import PageHeader from "../components/PageHeader";

const EmptyState = () => (
  <div className="hidden h-full flex-col items-center justify-center text-center lg:flex">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
      <HiOutlineChatBubbleLeftRight className="h-8 w-8" />
    </div>
    <p className="text-base font-bold text-slate-700">Select a conversation</p>
    <p className="mt-1 max-w-xs text-sm text-slate-400">
      Pick a user from the left to view and reply to their support conversation in real time.
    </p>
  </div>
);

// On phones there's only room for one pane at a time: show the channel list
// until a conversation is picked, then swap to the full-width channel view
// with a back button. Desktop keeps both panes side by side.
const ChatPanes = ({ userId }) => {
  const { channel, setActiveChannel } = useChatContext();

  return (
    <div className="flex h-full">
      <div
        className={`w-full shrink-0 overflow-y-auto border-r border-slate-100 lg:block lg:w-80 ${
          channel ? "hidden lg:block" : "block"
        }`}
      >
        <ChannelList
          filters={{ members: { $in: [userId] } }}
          sort={{ last_message_at: -1 }}
          options={{ state: true, watch: true, presence: true }}
        />
      </div>
      <div className={`min-w-0 flex-1 ${channel ? "block" : "hidden lg:block"}`}>
        <Channel EmptyStateIndicator={EmptyState}>
          <Window>
            <div className="flex items-center border-b border-slate-100 lg:hidden">
              <button
                onClick={() => setActiveChannel(undefined)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
              >
                <HiOutlineArrowLeft className="h-4.5 w-4.5" /> Back
              </button>
            </div>
            <ChannelHeader />
            <MessageList />
            <MessageComposer />
          </Window>
        </Channel>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { chatClient, ready } = useStream();

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title="Support Chat" subtitle="Reply to users in real time" />

      <div className="flex-1 overflow-hidden p-4 pt-4 sm:p-8 sm:pt-6">
        <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!ready || !chatClient ? (
            <div className="flex h-full items-center justify-center">
              <LoadingIndicator />
            </div>
          ) : (
            <Chat client={chatClient} theme="str-chat__theme-light">
              <ChatPanes userId={chatClient.userID} />
            </Chat>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
