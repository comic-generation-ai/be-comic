
// import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
// import {
//     IsNotEmpty,
//     IsString,
//     Length,
// } from 'class-validator';

// export class RegisterDto extends PartialType(CreateDTO) {
//     @ApiProperty()
//     @IsString()
//     @IsNotEmpty()
//     firstName?: string;

//     @ApiProperty()
//     @IsString()
//     @IsNotEmpty()
//     lastName?: string;

//     @ApiProperty()
//     @IsString()
//     @Length(10, 10)
//     @IsNotEmpty()
//     phoneNumber?: string;

//     @ApiProperty()
//     //@IsString()
//     backgroundColor?: string;

//     @ApiPropertyOptional({ maxLength: 30 })
//     referralCode?: string;
// }
