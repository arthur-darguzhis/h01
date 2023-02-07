import {NextFunction, Request, Response} from "express";
import {TooManyRequest} from "../exceptions/TooManyRequest";

class RateLimiter {

    private static singletone: RateLimiter;
    countOfRequestsFromIP;
    timePeriodInSec;
    map: any;

    public static manager() {
        if (RateLimiter.singletone) {
            return RateLimiter.singletone
        }
        RateLimiter.singletone = new RateLimiter(5, 10)
        return RateLimiter.singletone
    }

    private constructor(countOfRequestsFromIp: number, timePeriodInSec: number) {
        this.countOfRequestsFromIP = countOfRequestsFromIp
        this.timePeriodInSec = timePeriodInSec
        this.map = new Map<string, number>()
    }

    putData(ip: any, route: any): void | never {
        if (!this.map.hasOwnProperty(ip)) {
            this.map[ip] = {}
        }
        const ipCollection = this.map[ip];

        if (!this.map[ip].hasOwnProperty(route)) {
            this.map[ip][route] = []
        }

        const routeData: Array<number> = this.map[ip][route]

        this.map[ip][route] = routeData.filter((value) => {
            return (new Date().getTime() - value) < (10 * 1000)
        })

        if((this.map[ip][route].length === 5)){
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
