import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { defaultJwtStrategyName } from "../strategies/default-jwt.strategy";

@Injectable()
export class JwtAuthGuard extends AuthGuard(defaultJwtStrategyName) {}
