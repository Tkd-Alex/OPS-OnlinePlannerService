
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
export function toString(date: Date): string{
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getMilliseconds().toString().padStart(2, '0')}`;
}
