export interface Trip {
    _id: string;
    name: string;
    profilePicKey?: string;
    startDate?: string;
    endDate?: string;
    noOfDays?: number;
    noOfNights?: number; 
    noOfParticipants: number;
    profilePicUrl?: string;
};

export interface BinTrip {
    _id: string;
    name: string;
    profilePicKey?: string;
    startDate?: string;
    endDate?: string;
    noOfDays?: number;
    noOfNights?: number; 
    noOfParticipants: number;
    profilePicUrl?: string;
    noDates?: boolean;
};

export interface TripParticipant {
    participantUid: string;
    role: string;
}

export interface TripParticipantWithProfile {
    participantUid: string;
    role: string;
    username: string;
    profilePicKey?: string;
    profilePicUrl?: string;
}

export interface JoinRequestsWithProfile {
    uid: string;
    username: string,
    profilePicKey?: string,
    profilePicUrl?: string;
    requestAt: Date
}

export interface OrderInTab {
    [key: string]: string[];
}
