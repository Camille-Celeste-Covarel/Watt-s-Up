export interface CreateReservationBody {
    stationId: string;
    power: number;
    plugIds: string[];
}