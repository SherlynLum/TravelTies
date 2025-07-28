export interface User {
    uid: string,
    username: string,
    profilePicKey?: string,
    profilePicUrl?: string
}

export interface FriendRequest {
    uid: string,
    username: string,
    profilePicKey?: string,
    profilePicUrl?: string,
    requestTime: Date
}