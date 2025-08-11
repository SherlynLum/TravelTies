export interface Item {
    _id: string,
    tripId: string,
    type: string,
    isGroupItem: boolean,
    creatorUid: string,
    name: string,
    note?: string,
    date?: string,
    time?: string,
    notificationId?: string,
    isCompleted: boolean,
    hasPassedDdl: boolean
}