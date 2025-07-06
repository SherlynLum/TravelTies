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

export interface TripParticipant {
    participantUid: string;
    role: string;
}