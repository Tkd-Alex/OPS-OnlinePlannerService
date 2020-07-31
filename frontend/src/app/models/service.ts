import { User } from './user';

export class Service {
    id: number | null;
    name: string;
    price: number;
    durationM: number;
    description: string;
    createdDate?: string;
    updatedDate?: string;
    createdBy?: User | null;
    updatedBy?: User | null;
}

