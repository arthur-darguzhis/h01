import {Request} from "express";

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndQuery<T, U> = Request<T, {}, {}, U>
export type RequestWithParamsAndBody<T, U> = Request<T, {}, U>


