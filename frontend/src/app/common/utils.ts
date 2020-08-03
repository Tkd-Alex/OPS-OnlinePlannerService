
import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours,
    endOfWeek,
    addMinutes,
    getHours,
    set
} from 'date-fns';

import getUnixTime from 'date-fns/getUnixTime';
import isWithinRange from 'date-fns/isWithinInterval';
import { Reservation } from '../models/reservation';
import { Service } from '../models/service';

export function customDateParser(date: any, time: string): any {
    const hours = parseInt(time.split(':')[0], 0);
    const minutes = parseInt(time.split(':')[1], 0);

    return set(date, { hours, minutes });
}

export function isValidDate(date: Date, timeTable: any[]): boolean{
    let isValid = false;
    const day = timeTable[date.getDay() !== 0 ? date.getDay() - 1 : 6];
    ['morning', 'afternoon'].some((type: string) => {
        if (day[type].open !== null && day[type].close !== null){
            const open = customDateParser(date, day[type].open);
            const close = customDateParser(date, day[type].close);
            if (isWithinRange( date, { start: open, end: close } )) {
                isValid = true;
                return true;
            }
        }
    });
    return isValid;
}

// 2020-07-31 23:31:55
export function dateToString(date: Date): string{
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getMilliseconds().toString().padStart(2, '0')}`;
}

// mhh it's something like, push if not exist in array, remove if exist ...
export function makeEqualServicesArray(a: Service[], b: Service[], op: string = 'slice'): Service[] {
    for (let i = 0; i < a.length; i++){
        let founded = false;
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < b.length; j++){
            if (a[i].serviceId === b[j].serviceId && a[i].name === b[j].name){
                founded = true;
                break;
            }
        }
        if (founded === false && op === 'slice' && a[i].id) { a = a.filter((value, index) => index !== i ); }
        else if (founded === false && op === 'push') { b = [... b, { ... a[i], serviceId: a[i].id, id: null}]; }
    }
    return op === 'slice' ? a : b;
}
