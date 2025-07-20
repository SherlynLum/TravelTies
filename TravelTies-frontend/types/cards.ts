export interface CardPreview {
    _id: string,
    cardType: string, 
    title: string, 
    description?: string, 
    startDate?: number, 
    startTime?: string, 
    endDate?: number, 
    endTime?: string, 
    generalAddress?: string, 
    departureAddress?: string, 
    arrivalAddress?: string
}

export interface NoteCardPreview {
    tab: string,
    tripId: string,
    _id: string,
    title: string, 
    description?: string, 
    startDate?: number, 
    startTime?: string, 
    endDate?: number, 
    endTime?: string,
    removeFromTab: (id: string) => void;
}

export interface DestinationCardPreview {
    tab: string,
    tripId: string,
    _id: string,
    title: string, 
    startDate?: number, 
    startTime?: string, 
    endDate?: number, 
    endTime?: string, 
    removeFromTab: (id: string) => void;
}

export interface GeneralCardPreview {
    tab: string,
    tripId: string,
    _id: string,
    cardType: string,
    title: string, 
    startDate?: number, 
    startTime?: string, 
    endDate?: number, 
    endTime?: string, 
    generalAddress?: string, 
    removeFromTab: (id: string) => void;
}

export interface TransportationCardPreview {
    tab: string,
    tripId: string,
    _id: string,
    title: string, 
    startDate?: number, 
    startTime?: string, 
    endDate?: number, 
    endTime?: string, 
    departureAddress?: string, 
    arrivalAddress?: string
    removeFromTab: (id: string) => void;
}