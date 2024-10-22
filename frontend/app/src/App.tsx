import { useContext, useState } from 'react';
import { trpc } from './trpc';
import { UserContext } from './UserContext';
import { ThreadWithContent } from '../../../backend/src/services/threadService';

const App = () => {
  const authenticatedUser = useContext(UserContext)
  const [selectedThread, setSelectedThread] = useState<ThreadWithContent | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const userThreads = trpc.users.getUserThreads.useQuery({ username: authenticatedUser?.email || "" });
  const getOrCreateThread = trpc.threads.getOrCreateThread.useMutation();
  const postMessage = trpc.threads.postMessage.useMutation();

  void trpc.threads.threadMessages.useSubscription(
    { threadId: selectedThread?.id?.toString() || '' },
    {
      enabled: !!selectedThread,
      onData: (newMessage) => {
        setSelectedThread(prevThread => {
          if (!prevThread) return null;
          return {
            ...prevThread,
            messages: [...prevThread.messages, newMessage]
          };
        });
      },
    }
  );
  const handleThreadSelection = (threadId: number | null, participants?: string[]) => {
    if (participants) {
      getOrCreateThread.mutate({ participants }, {
        onSuccess: (newThread) => {
          setSelectedThread(newThread);
          userThreads.refetch();
        }
      });
    } else {
      getOrCreateThread.mutate({threadId: threadId!.toString()}, {
        onSuccess: (thread) => {
          setSelectedThread(thread)
          userThreads.refetch();
        }
      })
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      postMessage.mutate({
        threadId: selectedThread.id.toString(),
        content: newMessage,
        username: authenticatedUser!.email,
        createdAt: new Date().toISOString(),
      }, {
        onSuccess: () => {
          setNewMessage('');
        }
      });
    }
  };

  if (userThreads.isLoading) return <div className="flex items-center justify-center h-screen bg-orange-100">Loading...</div>;
  if (userThreads.error) return <div className="flex items-center justify-center h-screen bg-orange-100">Error: {userThreads.error.message}</div>;

  return (
    <div className="flex h-screen bg-orange-100">
      {/* Left column: Thread list */}
      <div className="w-1/3 bg-white border-r border-orange-200 overflow-y-auto">
        <h2 className="text-2xl font-bold p-4 text-orange-600 border-b border-orange-200">Chats</h2>
        <ul>
          {userThreads.data.threads.map(thread => (
            <li
              key={thread.id}
              className={`p-4 hover:bg-orange-50 cursor-pointer ${selectedThread?.id === thread.id ? 'bg-orange-100' : ''}`}
              onClick={() => handleThreadSelection(thread.id)}
            >
              {thread.Participants.find(p => p.name !== authenticatedUser!.name)?.name}
            </li>
          ))}
          {userThreads.data.noThread.map(user => (
            <li
              key={user.id}
              className={`p-4 hover:bg-orange-50 cursor-pointer ${selectedThread?.id === user.id ? 'bg-orange-100' : ''}`}
              onClick={() => handleThreadSelection(null, [authenticatedUser!.email, user.email])}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right column: Selected thread messages */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedThread ? (
          <>
            <div className="bg-orange-500 text-white p-4">
              <h2 className="text-xl font-semibold">
              {userThreads.data.threads.find(t => t.id === selectedThread.id)?.Participants.find(p => p.name !== authenticatedUser!.name)?.name ||
                 userThreads.data.threads.find(t => t.id === selectedThread.id)?.Participants[0].name}
              </h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {selectedThread.messages.map(message => (
                <div key={message.id} className={`mb-4}`}>
                  <div className={`inline-block p-2 rounded-lg}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-orange-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-3 py-2 bg-orange-50 border border-orange-300 rounded-l-md text-sm shadow-sm placeholder-orange-400
                             focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-orange-600">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
