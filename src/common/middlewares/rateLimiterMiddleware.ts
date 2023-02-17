import {NextFunction, Request, Response} from "express";
import {TooManyRequest} from "../exceptions/TooManyRequest";

type rateLimiterContainer = {
    [key: string]: RateLimiter
}

export class RateLimiter {
    private static container: rateLimiterContainer = {};
    countOfRequestsFromIP;
    timePeriodInSec;
    map: Array<any> = [];

    private constructor(countOfRequestsFromIp: number, timePeriodInSec: number) {
        this.countOfRequestsFromIP = countOfRequestsFromIp
        this.timePeriodInSec = timePeriodInSec
    }

    public static manager(count = 5, sec = 10) {
        const key = `${count}_${sec}`;
        if (RateLimiter.container && RateLimiter.container.hasOwnProperty(key)) {
            return RateLimiter.container[key]
        }
        RateLimiter.container[key] = new RateLimiter(count, sec)
        return RateLimiter.container[key]
    }

    public static resetContainer(): void {
        RateLimiter.container = {};
    }

    putData(ip: any, route: any): void | never {
        if (!this.map.hasOwnProperty(ip)) {
            this.map[ip] = []
        }

        if (!this.map[ip].hasOwnProperty(route)) {
            this.map[ip][route] = []
        }

        const lastRequestsData: Array<number> = this.map[ip][route]

        const lastRequestsInTimeLimit = lastRequestsData.filter((value) => {
            return (new Date().getTime() - value) < (10 * 1000)
        })

        if ((lastRequestsInTimeLimit.length === 5)) {
            throw new TooManyRequest('Too many request')
        }

        this.map[ip][route].push(new Date().getTime());
    }
}

export const checkRateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const rateLimiter = RateLimiter.manager()
    rateLimiter.putData(req.ip, req.originalUrl);
    next();
}

export const setRateLimiter = (count: number, sec: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const rateLimiter = RateLimiter.manager(count, sec)
        rateLimiter.putData(req.ip, req.originalUrl);
        next();
    }
}
