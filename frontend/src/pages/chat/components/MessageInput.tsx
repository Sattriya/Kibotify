import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Send } from "lucide-react";
import { useUser } from "@clerk/react";
import { useChatStore } from "../../../stores/useChatStore";

const MessageInput = () => {
    const [newMessage, setNewMessage] = useState("")
    const { user } = useUser()
    const { selectedUser, sendMessage } = useChatStore()

    const handleSend = () => {
        if (!selectedUser || !user || !newMessage) return
        sendMessage(user.id, selectedUser.clerkId, newMessage.trim())
        setNewMessage("")
    }

    return (
        <div className='p-4 mt-auto mb-2 border-t border-zinc-800'>
            <div className='flex gap-2'>
                <Input
                    placeholder='Type a message'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className='bg-zinc-800 border-none'
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />

                <Button size={"icon"} onClick={handleSend} disabled={!newMessage.trim()}>
                    <Send className='size-4' />
                </Button>
            </div>
        </div>
    );
}

export default MessageInput
