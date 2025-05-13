import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    console.log("Current online users:", onlineUsers);
  }, [onlineUsers]);

  useEffect(() => {
    getUsers();

    const interval = setInterval(() => {
      getUsers();
    }, 15000);
    if (socket) {
      socket.on("userStatusChange", () => {
        console.log("User status changed, refreshing users");
        getUsers();
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("userStatusChange");
      }
    };
  }, [getUsers, socket]);

  useEffect(() => {
    if (selectedUser) {
      useChatStore.getState().getMessages(selectedUser._id);
      useChatStore.getState().subscribeToMessages();
    }

    return () => {
      useChatStore.getState().unsubscribeFromMessages();
    };
  }, [selectedUser]);

  const filteredUsers =
    users && showOnlineOnly && onlineUsers
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users || [];

  if (isUsersLoading && users.length === 0) return <SidebarSkeleton />;

  const onlineCount = onlineUsers ? onlineUsers.length : 0;

  return (
    <aside className="h-full w-20 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineCount} online)</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
              }}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedUser?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers && onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                     rounded-full ring-2 ring-zinc-900"
                    title="Online"
                  />
                )}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers && onlineUsers.includes(user._id)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
