import { CallHandler, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Observable } from 'rxjs';


@Injectable()
export class VerifyTokenService {
    constructor(private jwtService: JwtService) {}
   
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        
       const token = request.headers.authorization?.replace('Bearer ', '');
    
        if (token) {
          try {
          
            const decoded = this.jwtService.verify(token);
            
           
            request.user = decoded;
            const { fullname } = decoded; 
            request.fullname = fullname;
          } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
          }
        } else {
          throw new UnauthorizedException('Token not provided');
        }
    
        return next.handle();
      }
    
}
