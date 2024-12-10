import { UserStats } from "../types";

export const isWithinLast24Hours = (date: string | number | Date) => {
        const now = new Date();
        const dateToCheck = new Date(date);
        const timeDifference = now.getTime() - dateToCheck.getTime();
        return timeDifference <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

export const calculateUserMoneyOwed = ({ completedItems, totalItems }: UserStats) => {
        const moneyMultiplier = Number(process.env.MONEY_MULTIPLIER);
        return (totalItems - completedItems) * moneyMultiplier;
};

export const dayStringToNumber = (day: string): number | undefined => {
        const daysMap: { [key: string]: number } = {
                mon: 1,
                monday: 1,
                tue: 2,
                tues: 2,
                tuesday: 2,
                wed: 3,
                wednesday: 3,
                thur: 4,
                thurs: 4,
                thursday: 4,
                fri: 5,
                friday: 5,
                sat: 6,
                saturday: 6,
                sun: 0,
                sunday: 0,
        };
        return daysMap[day.toLowerCase()];
}

